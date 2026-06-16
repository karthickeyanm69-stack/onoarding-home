export interface CountryData {
  code: string;
  name: string;
  flag: string;
  states: {
    code: string;
    name: string;
    cities: string[];
  }[];
}

export const locationData: CountryData[] = [
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    states: [
      {
        code: 'CA',
        name: 'California',
        cities: ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Sacramento']
      },
      {
        code: 'NY',
        name: 'New York',
        cities: ['New York City', 'Buffalo', 'Rochester', 'Syracuse', 'Albany']
      },
      {
        code: 'TX',
        name: 'Texas',
        cities: ['Houston', 'Austin', 'Dallas', 'San Antonio', 'Fort Worth']
      },
      {
        code: 'WA',
        name: 'Washington',
        cities: ['Seattle', 'Spokane', 'Tacoma', 'Bellevue', 'Olympia']
      }
    ]
  },
  {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    states: [
      {
        code: 'TN',
        name: 'Tamil Nadu',
        cities: ['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Tirunelveli']
      },
      {
        code: 'KA',
        name: 'Karnataka',
        cities: ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belagavi']
      },
      {
        code: 'MH',
        name: 'Maharashtra',
        cities: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik']
      },
      {
        code: 'DL',
        name: 'Delhi',
        cities: ['New Delhi', 'Dwarka', 'Saket', 'Karol Bagh', 'Vasant Kunj']
      }
    ]
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    states: [
      {
        code: 'ON',
        name: 'Ontario',
        cities: ['Toronto', 'Ottawa', 'Mississauga', 'Hamilton', 'London']
      },
      {
        code: 'QC',
        name: 'Quebec',
        cities: ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Sherbrooke']
      },
      {
        code: 'BC',
        name: 'British Columbia',
        cities: ['Vancouver', 'Victoria', 'Surrey', 'Burnaby', 'Kelowna']
      }
    ]
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    states: [
      {
        code: 'ENG',
        name: 'England',
        cities: ['London', 'Birmingham', 'Manchester', 'Leeds', 'Bristol']
      },
      {
        code: 'SCT',
        name: 'Scotland',
        cities: ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee']
      },
      {
        code: 'WLS',
        name: 'Wales',
        cities: ['Cardiff', 'Swansea', 'Newport', 'Bangor']
      }
    ]
  }
];
