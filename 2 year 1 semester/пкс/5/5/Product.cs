using System;
using System.Collections.Generic;

namespace StorageManagement
{
    public class Product
    {
        private static List<Product> allProducts = new List<Product>();

        private int id;
        private int supplierId;
        private string name;
        private double unitVolume;
        private double unitPrice;
        private int expirationDays;

        public int Id
        {
            get { return id; }
            private set { id = value; }
        }

        public int SupplierId
        {
            get { return supplierId; }
            private set { supplierId = value; }
        }

        public string Name
        {
            get { return name; }
            private set
            {
                name = value;
            }
        }

        public double UnitVolume
        {
            get { return unitVolume; }
            private set
            {
                unitVolume = value;
            }
        }

        public double UnitPrice
        {
            get { return unitPrice; }
            private set
            {
                unitPrice = value;
            }
        }

        public int ExpirationDays
        {
            get { return expirationDays; }
            set { expirationDays = value; }
        }

        public Product(int id, int supplierId, string name, double unitVolume, double unitPrice, int expirationDays)
        {
            Id = id;
            SupplierId = supplierId;
            Name = name;
            UnitVolume = unitVolume;
            UnitPrice = unitPrice;
            ExpirationDays = expirationDays;

            allProducts.Add(this);
        }

        public void EditProduct(string name, double unitVolume, double unitPrice, int expirationDays)
        {
            Name = name;
            UnitVolume = unitVolume;
            UnitPrice = unitPrice;
            ExpirationDays = expirationDays;
        }

        public string GetProductInfo()
        {
            return $"Товар #{Id}\n" +
                   $"Поставщик: #{SupplierId}\n" +
                   $"Название: {Name}\n" +
                   $"Объем единицы: {UnitVolume} м³\n" +
                   $"Цена единицы: {UnitPrice} руб.\n" +
                   $"Дней до истечения срока: {ExpirationDays}";
        }

        public static Product FindProductById(int id)
        {
            return allProducts.Find(p => p.Id == id);
        }

        public static bool DeleteProductById(int id)
        {
            Product product = FindProductById(id);
            if (product != null)
            {
                allProducts.Remove(product);
                return true;
            }
            return false;
        }
    }
}