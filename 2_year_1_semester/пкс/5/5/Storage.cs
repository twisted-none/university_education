using System;
using System.Collections.Generic;
using System.Linq;

namespace StorageManagement
{
    public class Storage
    {
        private int id;
        private string type;
        private double volume;
        private string address;
        private List<Product> products;

        public int Id
        {
            get { return id; }
            private set { id = value; }
        }

        public string Type
        {
            get { return type; }
            private set
            {
                type = value;
            }
        }

        public double Volume
        {
            get { return volume; }
            private set
            {
                volume = value;
            }
        }

        public string Address
        {
            get { return address; }
            private set
            {
                address = value;
            }
        }

        public List<Product> Products
        {
            get { return products; }
            private set { products = value; }
        }

        public double OccupiedVolume
        {
            get { return Products.Sum(p => p.UnitVolume); }
        }

        public double FreeVolume
        {
            get { return Volume - OccupiedVolume; }
        }

        public Storage(int id, string type, double volume, string address)
        {
            Id = id;
            Type = type;
            Volume = volume;
            Address = address;
            Products = new List<Product>();
        }

        public void EditStorage(string type, double volume, string address)
        {
            Type = type;
            Volume = volume;
            Address = address; 
        }

        public string GetStorageInfo()
        {
            return $"Склад #{Id}\n" +
                   $"Тип: {Type}\n" +
                   $"Объем: {Volume} м³\n" +
                   $"Свободный объем: {FreeVolume} м³\n" +
                   $"Адрес: {Address}\n" +
                   $"Количество товаров: {Products.Count}";
        }

        public bool AddProduct(Product product)
        {

            if (product != null && (FreeVolume) >= product.UnitVolume)
            {
                Products.Add(product);
                return true;
            }
            return false;
        }

        public bool RemoveProduct(Product product)
        {
            
            if (product != null && (FreeVolume) >= product.UnitVolume)
            {
                Products.Remove(product);
                return true;
            };

            return false;
        }

    }
}