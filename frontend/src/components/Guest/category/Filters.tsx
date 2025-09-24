export default function Filters() {
  return (
    <aside className="w-48 p-2">
      <h3 className="font-semibold mb-2">Filters</h3>
      <div className="mb-4">
        <h4 className="font-medium">Deals</h4>
        <label>
          <input type="checkbox" /> Deals
        </label>
      </div>
      <div className="mb-4">
        <h4 className="font-medium">Price</h4>
        <ul>
          <li>
            <input type="radio" name="price" /> All
          </li>
          <li>
            <input type="radio" name="price" /> $1–$2
          </li>
          <li>
            <input type="radio" name="price" /> $2–$5
          </li>
          <li>
            <input type="radio" name="price" /> $5+
          </li>
        </ul>
      </div>
      <div className="mb-4">
        <h4 className="font-medium">Made In</h4>
        <ul>
          <li>
            <input type="radio" name="made" /> All
          </li>
          <li>
            <input type="radio" name="made" /> United States
          </li>
        </ul>
      </div>
    </aside>
  );
}
