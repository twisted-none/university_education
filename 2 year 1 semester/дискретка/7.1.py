class MonoalphabeticCipher:
    def __init__(self, k1=5, k2=3):
        # Русский алфавит
        self.alphabet = 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'
        self.N = len(self.alphabet)
        self.k1 = k1
        self.k2 = k2
        
    def encrypt(self, text):
        text = text.upper()
        result = ''
        
        for char in text:
            if char in self.alphabet:
                Xi = self.alphabet.index(char)
                Yi = (self.k1 * Xi + self.k2) % self.N
                result += self.alphabet[Yi]
            else:
                result += char
                
        return result
    
    def decrypt(self, text):
        text = text.upper()
        result = ''
        
        
        k1_inv = self._mod_inverse(self.k1, self.N)
        
        for char in text:
            if char in self.alphabet:
                
                Yi = self.alphabet.index(char)
                
                Xi = (k1_inv * (Yi - self.k2)) % self.N
                
                result += self.alphabet[Xi]
            else:
                result += char
                
        return result
    
    def _mod_inverse(self, a, m):
        def extended_gcd(a, b):
            if a == 0:
                return b, 0, 1
            gcd, x1, y1 = extended_gcd(b % a, a)
            x = y1 - (b // a) * x1
            y = x1
            return gcd, x, y
        
        gcd, x, _ = extended_gcd(a, m)
        
        if gcd != 1:
            raise ValueError("Мультипликативное обратное не существует")
        
        return x % m

if __name__ == "__main__":
    cipher = MonoalphabeticCipher(k1=1, k2=3)
    
    original_text = "МЫ УЧИМСЯ ШИФРОВАТЬ"
    
    encrypted = cipher.encrypt(original_text)
    print(f"Исходный текст: {original_text}")
    print(f"Зашифрованный текст: {encrypted}")
    
    decrypted = cipher.decrypt(encrypted)
    print(f"Расшифрованный текст: {decrypted}")
