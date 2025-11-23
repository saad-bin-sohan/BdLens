from passlib.context import CryptContext


# Configure Passlib to use Argon2 for password hashing.
# Argon2 is a modern, memory-hard algorithm and does not have
# bcrypt's 72-byte password length limit.
pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto",
)


def hash_password(password: str) -> str:
    """
    Hash a plaintext password using Argon2.

    This function is called when creating a new user or updating a password.
    It returns a string that includes the algorithm, parameters, salt, and hash.
    """
    if not isinstance(password, str):
        raise TypeError("Password must be a string.")

    # You can optionally enforce length limits here if you want,
    # for example: 8 <= len(password) <= 128
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plaintext password against a stored Argon2 hash.

    Returns True if the password is correct, False otherwise.
    """
    if not isinstance(plain_password, str) or not isinstance(hashed_password, str):
        return False

    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        # If the hash is invalid or uses an unknown scheme, treat as a mismatch.
        return False
