import axios from 'axios';

const BASE_URL = "https://app.esticrm.pl/apiClient";
const COMPANY_ID = "10482";
const TOKEN = "9e5a6925a9";
const AGENT_ID = "91281";

export interface EstateOffer {
  id: number;
  price: string;
  areaTotal: string;
  locationCityName: string;
  locationPrecinctName: string;
  pictures: string[];
  portalTitle: string;
  typeName: string;
  contactFirstname: string;
  contactLastname: string;
  contactEmail: string;
  contactPhone: string;
  description: string;
  contactId: number;
  apartmentRoomNumber?: number;
  apartmentFloor?: number;
  buildingYear?: number;
  buildingType?: string;
  apartmentRent?: string;
  apartmentEquipment?: string;
  mediaWater?: boolean;
  mediaGas?: boolean;
  mediaCurrent?: boolean;
  mediaInternet?: boolean;
}

// Mock data for when API calls fail
const MOCK_OFFERS: EstateOffer[] = [
  {
    id: 1,
    price: "950000",
    areaTotal: "78",
    locationCityName: "Warszawa",
    locationPrecinctName: "Mokotów",
    pictures: [
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1560185007-5f0bb1866cab?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1560185008-a8b2d4ab5071?auto=format&fit=crop&q=80"
    ],
    portalTitle: "Nowoczesne 3-pokojowe mieszkanie na Mokotowie",
    typeName: "Mieszkanie na sprzedaż",
    contactFirstname: "Łukasz",
    contactLastname: "Paziewski",
    contactEmail: "lukasz@theestate.pl",
    contactPhone: "+48 123 456 789",
    description: "<p>Przestronne mieszkanie w doskonałej lokalizacji. W pobliżu liczne sklepy, restauracje i parki.</p><p>Mieszkanie składa się z trzech pokoi, kuchni, łazienki oraz przedpokoju. Z okien roztacza się piękny widok na panoramę miasta.</p>",
    contactId: 91281,
    apartmentRoomNumber: 3,
    apartmentFloor: 4,
    buildingYear: 2018,
    mediaWater: true,
    mediaGas: true,
    mediaCurrent: true,
    mediaInternet: true
  },
  {
    id: 2,
    price: "1500000",
    areaTotal: "120",
    locationCityName: "Warszawa",
    locationPrecinctName: "Żoliborz",
    pictures: [
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?auto=format&fit=crop&q=80"
    ],
    portalTitle: "Luksusowy apartament na Żoliborzu",
    typeName: "Apartament na sprzedaż",
    contactFirstname: "Łukasz",
    contactLastname: "Paziewski",
    contactEmail: "lukasz@theestate.pl",
    contactPhone: "+48 123 456 789",
    description: "<p>Ekskluzywny apartament w prestiżowej dzielnicy Żoliborz. Wysoki standard wykończenia.</p><p>Nieruchomość obejmuje salon z aneksem kuchennym, dwie sypialnie, dwie łazienki oraz garderobę. Do apartamentu przynależy miejsce parkingowe w garażu podziemnym.</p>",
    contactId: 91281,
    apartmentRoomNumber: 3,
    apartmentFloor: 2,
    buildingYear: 2020,
    mediaWater: true,
    mediaGas: true,
    mediaCurrent: true,
    mediaInternet: true
  },
  {
    id: 3,
    price: "850000",
    areaTotal: "65",
    locationCityName: "Warszawa",
    locationPrecinctName: "Wola",
    pictures: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&q=80"
    ],
    portalTitle: "Przytulne 2-pokojowe mieszkanie na Woli",
    typeName: "Mieszkanie na sprzedaż",
    contactFirstname: "Łukasz",
    contactLastname: "Paziewski",
    contactEmail: "lukasz@theestate.pl",
    contactPhone: "+48 123 456 789",
    description: "<p>Komfortowe mieszkanie w nowoczesnym budownictwie z 2019 roku. Doskonała lokalizacja - blisko stacji metra.</p><p>Mieszkanie składa się z salonu z aneksem kuchennym, sypialni, łazienki i przedpokoju. Mieszkanie jest jasne i ciche. Widok z okien na patio wewnętrzne.</p>",
    contactId: 91281,
    apartmentRoomNumber: 2,
    apartmentFloor: 3,
    buildingYear: 2019,
    mediaWater: true,
    mediaGas: true,
    mediaCurrent: true,
    mediaInternet: true
  }
];

export const estateApi = {
  async getOffers(): Promise<EstateOffer[]> {
    try {
      console.log("Fetching offers from API...");
      const response = await axios.get(`${BASE_URL}/offer/list`, {
        params: {
          company: COMPANY_ID,
          token: TOKEN,
          take: 1000
        }
      });

      if (!response.data.data) {
        console.error("No offers returned from API. Using mock data.");
        return MOCK_OFFERS;
      }

      // Filter offers for the specific agent
      const offers = response.data.data.filter((offer: any) => 
        String(offer.contactId) === String(AGENT_ID)
      );

      return offers.length > 0 ? offers : MOCK_OFFERS;
    } catch (error) {
      console.error('Error fetching offers:', error);
      console.log('Using mock data instead');
      return MOCK_OFFERS;
    }
  },

  async getOfferDetails(offerId: number): Promise<EstateOffer | null> {
    try {
      console.log(`Fetching details for offer ID: ${offerId}`);
      const response = await axios.get(`${BASE_URL}/offer/details`, {
        params: {
          company: COMPANY_ID,
          token: TOKEN,
          id: offerId
        }
      });

      if (!response.data.data) {
        console.error("No offer details returned from API. Using mock data.");
        return MOCK_OFFERS.find(offer => offer.id === offerId) || null;
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching offer details:', error);
      console.log('Using mock data instead');
      return MOCK_OFFERS.find(offer => offer.id === offerId) || null;
    }
  }
};