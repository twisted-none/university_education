using System.Collections.Generic;
using TravelGuide.Data.Entities;

namespace TravelGuide.Web.Models.CitiesViewModels
{
    public class CitiesListViewModel
    {
        public IEnumerable<City> Cities { get; set; }
        public string SearchString { get; set; }
    }
}
