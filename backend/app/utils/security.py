import hashlib
import secrets

def hash_password(password:str)->str:
    salt = secrets.token_bytes(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100_000)
    return f"{salt.hex()}:{key.hex()}"

def verify_pass(password:str,stored_hash:str)->bool:
    try:
        salt_hex,key_hex = stored_hash.split(":")
        salt = bytes.fromhex(salt_hex)
        expected_key = bytes.fromhex(key_hex)
        computed_key = hashlib.pbkdf2_hmac("sha256",password.encode("utf-8"),salt,100_000)
        return secrets.compare_digest(computed_key,expected_key)
    except Exception:
        return False
