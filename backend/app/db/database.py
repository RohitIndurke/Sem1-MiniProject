import uuid
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

# Single client instance reused across the app lifetime
client: AsyncIOMotorClient | None = None
is_connected: bool = False

# Resilient in-memory storage: active during testing or when Atlas IP access is pending
memory_store = {
    "users": {},        # email -> user document
    "submissions": [],  # list of submission documents
}

def is_db_connected() -> bool:
    """Return whether live connection to MongoDB Atlas is verified."""
    return is_connected

def get_db():
    """Return the database instance."""
    if client is None:
        raise RuntimeError("Database client is not initialized.")
    return client[settings.MONGODB_DB_NAME]

async def connect_db():
    """Attempt connecting and pinging MongoDB Atlas with a 3-second timeout."""
    global client, is_connected
    try:
        client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=3000,
            connectTimeoutMS=3000,
        )
        await client.admin.command("ping")
        is_connected = True
        print(f"✅ Connected to MongoDB Atlas | db: {settings.MONGODB_DB_NAME}")
    except Exception as e:
        is_connected = False
        print(
            f"⚠️ Notice: MongoDB Atlas ping failed ({type(e).__name__}).\n"
            f"   Root cause: Your IP needs to be whitelisted in MongoDB Atlas Network Access.\n"
            f"   Activating in-memory fallback store so auth & analyze workflows work uninterrupted."
        )

async def close_db():
    """Close MongoDB client gracefully."""
    global client, is_connected
    if client:
        try:
            client.close()
        except Exception:
            pass
        client = None
    is_connected = False
    print("🔌 MongoDB connection closed")


# Helper repository functions with automatic Atlas + Fallback
async def find_user_by_email(email: str):
    email = email.strip().lower()
    if is_connected and client is not None:
        try:
            return await client[settings.MONGODB_DB_NAME]["users"].find_one({"email": email})
        except Exception as e:
            print(f"⚠️ MongoDB query error ({e}), falling back to memory store")
    return memory_store["users"].get(email)

async def save_user(user_doc: dict) -> str:
    email = user_doc["email"].strip().lower()
    user_id = str(uuid.uuid4())

    if is_connected and client is not None:
        try:
            res = await client[settings.MONGODB_DB_NAME]["users"].insert_one(user_doc)
            user_id = str(res.inserted_id)
        except Exception as e:
            print(f"⚠️ MongoDB insert error ({e}), storing in memory")

    # Mirror in memory
    saved_doc = dict(user_doc)
    saved_doc["_id"] = user_id
    memory_store["users"][email] = saved_doc
    return user_id

async def save_submission(submission_doc: dict) -> str:
    sub_id = str(uuid.uuid4())

    if is_connected and client is not None:
        try:
            res = await client[settings.MONGODB_DB_NAME]["submissions"].insert_one(submission_doc)
            sub_id = str(res.inserted_id)
        except Exception as e:
            print(f"⚠️ MongoDB submission insert error: {e}")

    saved_doc = dict(submission_doc)
    saved_doc["_id"] = sub_id
    memory_store["submissions"].append(saved_doc)
    return sub_id

async def fetch_submissions(limit: int = 10, skip: int = 0):
    if is_connected and client is not None:
        try:
            db = client[settings.MONGODB_DB_NAME]
            cursor = db["submissions"].find().sort("created_at", -1).skip(skip).limit(limit)
            items = []
            async for doc in cursor:
                doc["id"] = str(doc.pop("_id"))
                items.append(doc)
            total = await db["submissions"].count_documents({})
            return items, total
        except Exception as e:
            print(f"⚠️ MongoDB fetch error: {e}")

    # Fallback from memory store (newest first)
    all_subs = list(reversed(memory_store["submissions"]))
    total = len(all_subs)
    paged = all_subs[skip : skip + limit]
    results = []
    for s in paged:
        item = dict(s)
        item["id"] = str(item.pop("_id", item.get("id", "")))
        results.append(item)
    return results, total
