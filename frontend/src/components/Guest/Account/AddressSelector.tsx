import { useState } from "react";
import { districts } from "../../../data/Guest/hcm_districts_sample";

export interface UserAddress {
  district: string;
  ward: string;
  street: string;
  latitude: number;
  longitude: number;
}

interface Ward {
  name: string;
  latitude: number;
  longitude: number;
}
interface District {
  name: string;
  wards: Ward[];
}

const typedDistricts: District[] = districts;

export default function AddressSelector({
  value,
  onChange,
}: {
  value?: UserAddress;
  onChange: (address: UserAddress) => void;
}) {
  const [selectedDistrict, setSelectedDistrict] = useState<string>(value?.district || "");
  const [selectedWard, setSelectedWard] = useState<string>(value?.ward || "");
  const [street, setStreet] = useState<string>(value?.street || "");

  const districtObj = typedDistricts.find((d: District) => d.name === selectedDistrict);
  const wardObj = districtObj?.wards.find((w: Ward) => w.name === selectedWard);

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDistrict(e.target.value);
    setSelectedWard("");
  };
  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWard(e.target.value);
  };
  const handleStreetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStreet(e.target.value);
  };
  const handleSave = () => {
    if (districtObj && wardObj && street) {
      onChange({
        district: districtObj.name,
        ward: wardObj.name,
        street,
        latitude: wardObj.latitude,
        longitude: wardObj.longitude,
      });
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block font-medium mb-1">Quận/Huyện</label>
        <select
          className="border rounded px-2 py-1 w-full"
          value={selectedDistrict}
          onChange={handleDistrictChange}
        >
          <option value="">Chọn Quận/Huyện</option>
          {typedDistricts.map((d: District) => (
            <option key={d.name} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-medium mb-1">Phường/Xã</label>
        <select
          className="border rounded px-2 py-1 w-full"
          value={selectedWard}
          onChange={handleWardChange}
          disabled={!selectedDistrict}
        >
          <option value="">Chọn Phường/Xã</option>
          {districtObj?.wards.map((w: Ward) => (
            <option key={w.name} value={w.name}>
              {w.name}
            </option>
          ))}
        </select>
      </div>
      {/* Thay select thành input cho số nhà, tên đường */}
      <div>
        <label className="block font-medium mb-1">Số nhà, tên đường</label>
        <input
          className="border rounded px-2 py-1 w-full"
          value={street}
          onChange={handleStreetChange}
          placeholder="VD: 123 Nguyễn Trãi"
        />
      </div>
      <button
        className="bg-green-600 text-white px-4 py-2 rounded mt-2"
        onClick={handleSave}
        disabled={!selectedDistrict || !selectedWard || !street}
      >
        Lưu địa chỉ
      </button>
    </div>
  );
}
