import React, { useState ,useEffect} from "react";
import styles from "./Styles/Services.module.css";
import Card from "../Components/Card";

function Services() {
  const [search, setSearch] = useState("");
  const [chefs, setChefs] = useState([]);

  //  Default 
  const defaultChefs = [
    { name: "Chef Vishal", rating: "⭐ 4.9", price: 599 },
    { name: "Chef Anant", rating: "⭐ 4.7", price: 699 },
    { name: "Chef Vinayak", rating: "⭐ 4.8", price: 799 },
  ];

  // 🚀 Fetch from backend
//  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchChefs = async () => {
    try {
      // const res = await fetch("http://localhost:8080/api/chefs");
      const data = await res.json();

      setChefs(data.length ? data : defaultChefs);
    } catch {
      setChefs(defaultChefs);
    } finally {
      // setLoading(false);
    }
  };

  fetchChefs();
}, []);

  // 🔍 Search filter
  const filteredChefs = chefs.filter((chef) =>
    chef.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.services}>

      {/* 🔍 SEARCH */}
      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="Search chef by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 📖 ABOUT */}
      <section className={styles.about}>
        <h2>Our Services</h2>
        <p>
          We provide professional chefs for home cooking, parties, and events.
          Our chefs ensure hygienic, delicious, and customized meals tailored
          to your needs.
        </p>
      </section>

      {/* 👨‍🍳 CHEFS */}
      <section className={styles.list}>
        <h2>Available Chefs</h2>

        <div className={styles.cards}>
          {filteredChefs.map((chef, i) => (
            <Card
              key={i}
              title={chef.name}
              subtitle={`⭐ ${chef.rating}`}
              icon="👨‍🍳"
              price={chef.price}
            />
          ))}
        </div>
      </section>

    </div>
  );
}


export default Services;