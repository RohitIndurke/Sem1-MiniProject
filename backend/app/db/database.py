from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

# Single client instance reused across the app lifetime
client: AsyncIOMotorClient | None = None

def get_db():
    """Return the database instance."""
    if client is None:
        raise RuntimeError("Database client is not initialized.")
    return client[settings.MONGODB_DB_NAME]

async def connect_db():
    global client
    try:
        client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=15000,
        )
        await client.admin.command("ping")
        print(f" Connected to MongoDB Atlas | db: {settings.MONGODB_DB_NAME}")
    except Exception as e:
        print(f" Warning: Failed to connect to MongoDB: {e}")

async def close_db():
    global client
    if client:
        client.close()
        client = None
        print("🔌 MongoDB connection closed")
