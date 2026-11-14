from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

# Single client instance reused across the app lifetime
client: AsyncIOMotorClient = None

def get_db():
    """Return the database instance."""
    return client[settings.MONGO_DB_NAME]

async def connect_db():
    global client
    client = AsyncIOMotorClient(settings.MONGO_URI)
    # Ping to verify connection
    await client.admin.command("ping")
    print(f"✅ Connected to MongoDB: {settings.MONGO_URI} | db: {settings.MONGO_DB_NAME}")

async def close_db():
    global client
    if client:
        client.close()
        print("🔌 MongoDB connection closed")

