import secrets
import string

def generate_ticket_key(length=12):
    """
    Bíztonságos véletlenszerű betű- és számkombinációt generál a QR-kódhoz.
    Példa: 'A7K2L9X5B3Q1'
    """
    alphabet = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

if __name__ == "__main__":
    print(f"Generating a random ticket key...{generate_ticket_key()}")