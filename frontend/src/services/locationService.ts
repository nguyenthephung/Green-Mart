// Vietnamese administrative divisions data
export interface Province {
  code: string;
  name: string;
  type: string;
  districts: District[];
}

export interface District {
  code: string;
  name: string;
  type: string;
  provinceCode: string;
  wards: Ward[];
}

export interface Ward {
  code: string;
  name: string;
  type: string;
  districtCode: string;
}

// Major provinces and cities in Vietnam
export const VIETNAM_PROVINCES: Province[] = [
  {
    code: "01",
    name: "Hà Nội",
    type: "Thành phố Trung ương",
    districts: [
      {
        code: "001",
        name: "Ba Đình",
        type: "Quận",
        provinceCode: "01",
        wards: [
          { code: "00001", name: "Phúc Xá", type: "Phường", districtCode: "001" },
          { code: "00002", name: "Trúc Bạch", type: "Phường", districtCode: "001" },
          { code: "00003", name: "Vĩnh Phúc", type: "Phường", districtCode: "001" },
          { code: "00004", name: "Cống Vị", type: "Phường", districtCode: "001" },
          { code: "00005", name: "Liễu Giai", type: "Phường", districtCode: "001" },
        ]
      },
      {
        code: "002",
        name: "Hoàn Kiếm",
        type: "Quận",
        provinceCode: "01",
        wards: [
          { code: "00006", name: "Phan Chu Trinh", type: "Phường", districtCode: "002" },
          { code: "00007", name: "Tràng Tiền", type: "Phường", districtCode: "002" },
          { code: "00008", name: "Trần Hưng Đạo", type: "Phường", districtCode: "002" },
          { code: "00009", name: "Hàng Bài", type: "Phường", districtCode: "002" },
          { code: "00010", name: "Hàng Bồ", type: "Phường", districtCode: "002" },
        ]
      },
      {
        code: "003",
        name: "Tây Hồ",
        type: "Quận",
        provinceCode: "01",
        wards: [
          { code: "00011", name: "Phú Thượng", type: "Phường", districtCode: "003" },
          { code: "00012", name: "Nhật Tân", type: "Phường", districtCode: "003" },
          { code: "00013", name: "Tứ Liên", type: "Phường", districtCode: "003" },
          { code: "00014", name: "Quảng An", type: "Phường", districtCode: "003" },
          { code: "00015", name: "Xuân La", type: "Phường", districtCode: "003" },
        ]
      },
      {
        code: "004",
        name: "Long Biên",
        type: "Quận",
        provinceCode: "01",
        wards: [
          { code: "00016", name: "Thượng Thanh", type: "Phường", districtCode: "004" },
          { code: "00017", name: "Ngọc Thụy", type: "Phường", districtCode: "004" },
          { code: "00018", name: "Giang Biên", type: "Phường", districtCode: "004" },
          { code: "00019", name: "Đức Giang", type: "Phường", districtCode: "004" },
          { code: "00020", name: "Việt Hưng", type: "Phường", districtCode: "004" },
        ]
      },
      {
        code: "005",
        name: "Cầu Giấy",
        type: "Quận",
        provinceCode: "01",
        wards: [
          { code: "00021", name: "Nghĩa Đô", type: "Phường", districtCode: "005" },
          { code: "00022", name: "Nghĩa Tân", type: "Phường", districtCode: "005" },
          { code: "00023", name: "Mai Dịch", type: "Phường", districtCode: "005" },
          { code: "00024", name: "Dịch Vọng", type: "Phường", districtCode: "005" },
          { code: "00025", name: "Dịch Vọng Hậu", type: "Phường", districtCode: "005" },
        ]
      }
    ]
  },
  {
    code: "79",
    name: "Thành phố Hồ Chí Minh",
    type: "Thành phố Trung ương",
    districts: [
      {
        code: "760",
        name: "Quận 1",
        type: "Quận",
        provinceCode: "79",
        wards: [
          { code: "26734", name: "Tân Định", type: "Phường", districtCode: "760" },
          { code: "26737", name: "Đa Kao", type: "Phường", districtCode: "760" },
          { code: "26740", name: "Bến Nghé", type: "Phường", districtCode: "760" },
          { code: "26743", name: "Bến Thành", type: "Phường", districtCode: "760" },
          { code: "26746", name: "Nguyễn Thái Bình", type: "Phường", districtCode: "760" },
        ]
      },
      {
        code: "761",
        name: "Quận 12",
        type: "Quận",
        provinceCode: "79",
        wards: [
          { code: "26749", name: "Thạnh Xuân", type: "Phường", districtCode: "761" },
          { code: "26752", name: "Thạnh Lộc", type: "Phường", districtCode: "761" },
          { code: "26755", name: "Hiệp Thành", type: "Phường", districtCode: "761" },
          { code: "26758", name: "Thới An", type: "Phường", districtCode: "761" },
          { code: "26761", name: "Tân Chánh Hiệp", type: "Phường", districtCode: "761" },
        ]
      },
      {
        code: "764",
        name: "Quận Gò Vấp",
        type: "Quận",
        provinceCode: "79",
        wards: [
          { code: "26764", name: "Phường 1", type: "Phường", districtCode: "764" },
          { code: "26767", name: "Phường 3", type: "Phường", districtCode: "764" },
          { code: "26770", name: "Phường 4", type: "Phường", districtCode: "764" },
          { code: "26773", name: "Phường 5", type: "Phường", districtCode: "764" },
          { code: "26776", name: "Phường 6", type: "Phường", districtCode: "764" },
        ]
      },
      {
        code: "765",
        name: "Quận Bình Thạnh",
        type: "Quận",
        provinceCode: "79",
        wards: [
          { code: "26779", name: "Phường 1", type: "Phường", districtCode: "765" },
          { code: "26782", name: "Phường 2", type: "Phường", districtCode: "765" },
          { code: "26785", name: "Phường 3", type: "Phường", districtCode: "765" },
          { code: "26788", name: "Phường 5", type: "Phường", districtCode: "765" },
          { code: "26791", name: "Phường 6", type: "Phường", districtCode: "765" },
        ]
      },
      {
        code: "766",
        name: "Quận Tân Bình",
        type: "Quận",
        provinceCode: "79",
        wards: [
          { code: "26794", name: "Phường 1", type: "Phường", districtCode: "766" },
          { code: "26797", name: "Phường 2", type: "Phường", districtCode: "766" },
          { code: "26800", name: "Phường 3", type: "Phường", districtCode: "766" },
          { code: "26803", name: "Phường 4", type: "Phường", districtCode: "766" },
          { code: "26806", name: "Phường 5", type: "Phường", districtCode: "766" },
        ]
      }
    ]
  },
  {
    code: "48",
    name: "Đà Nẵng",
    type: "Thành phố Trung ương",
    districts: [
      {
        code: "490",
        name: "Liên Chiểu",
        type: "Quận",
        provinceCode: "48",
        wards: [
          { code: "20194", name: "Hòa Hiệp Bắc", type: "Phường", districtCode: "490" },
          { code: "20197", name: "Hòa Hiệp Nam", type: "Phường", districtCode: "490" },
          { code: "20200", name: "Hòa Khánh Bắc", type: "Phường", districtCode: "490" },
          { code: "20203", name: "Hòa Khánh Nam", type: "Phường", districtCode: "490" },
          { code: "20206", name: "Hòa Minh", type: "Phường", districtCode: "490" },
        ]
      },
      {
        code: "491",
        name: "Thanh Khê",
        type: "Quận",
        provinceCode: "48",
        wards: [
          { code: "20209", name: "Tam Thuận", type: "Phường", districtCode: "491" },
          { code: "20212", name: "Thanh Khê Tây", type: "Phường", districtCode: "491" },
          { code: "20215", name: "Thanh Khê Đông", type: "Phường", districtCode: "491" },
          { code: "20218", name: "Xuân Hà", type: "Phường", districtCode: "491" },
          { code: "20221", name: "Tân Chính", type: "Phường", districtCode: "491" },
        ]
      }
    ]
  }
];

export class LocationService {
  static getProvinces(): Province[] {
    return VIETNAM_PROVINCES;
  }

  static getDistrictsByProvince(provinceCode: string): District[] {
    const province = VIETNAM_PROVINCES.find(p => p.code === provinceCode);
    return province?.districts || [];
  }

  static getWardsByDistrict(districtCode: string): Ward[] {
    for (const province of VIETNAM_PROVINCES) {
      const district = province.districts.find(d => d.code === districtCode);
      if (district) {
        return district.wards;
      }
    }
    return [];
  }

  static getProvinceByCode(code: string): Province | undefined {
    return VIETNAM_PROVINCES.find(p => p.code === code);
  }

  static getDistrictByCode(code: string): District | undefined {
    for (const province of VIETNAM_PROVINCES) {
      const district = province.districts.find(d => d.code === code);
      if (district) return district;
    }
    return undefined;
  }

  static getWardByCode(code: string): Ward | undefined {
    for (const province of VIETNAM_PROVINCES) {
      for (const district of province.districts) {
        const ward = district.wards.find(w => w.code === code);
        if (ward) return ward;
      }
    }
    return undefined;
  }

  // Calculate shipping fee based on location
  static calculateShippingFee(provinceCode: string, districtCode: string): number {
    const province = this.getProvinceByCode(provinceCode);
    if (!province) return 50000; // Default fee

    // Major cities have lower shipping fees
    const majorCities = ["01", "79", "48"]; // Hanoi, HCMC, Da Nang
    
    if (majorCities.includes(provinceCode)) {
      return 25000; // Inner city fee
    }

    return 35000; // Other provinces
  }
}
