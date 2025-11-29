import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import MenuItem from "@/models/MenuItem";
import Table from "@/models/Table";

export async function GET() {
  await connectDB();

  // --- 1. THE COMPLETE MG CAFE MENU ---
  const MENU_ITEMS = [
    // === PIZZA ===
    { name: "Veg Cheese Pizza", price: 109, category: "Pizza", description: "Classic veg pizza with loads of cheese", image: "/menu/veg-pizza.jpg" },
    { name: "Paneer Pizza", price: 119, category: "Pizza", description: "Topped with fresh paneer cubes", image: "/menu/paneer-pizza.jpg" },
    { name: "Schezwan Pizza", price: 119, category: "Pizza", description: "Spicy Schezwan sauce base", image: "/menu/schezwan-pizza.jpg" },
    { name: "Jain Pizza", price: 119, category: "Pizza", description: "No onion, no garlic special", image: "/menu/veg-pizza.jpg" },
    { name: "Corn Pizza", price: 125, category: "Pizza", description: "Sweet corn and cheese delight", image: "/menu/corn-pizza.jpg" },
    { name: "Mix Veg Pizza", price: 125, category: "Pizza", description: "Loaded with crunchy vegetables", image: "/menu/veg-pizza.jpg" },
    { name: "Paneer Schezwan Pizza", price: 135, category: "Pizza", description: "Spicy paneer fusion", image: "/menu/paneer-pizza.jpg" },
    { name: "Chocolate Pizza", price: 135, category: "Pizza", description: "Unique dessert pizza with chocolate sauce", image: "/menu/chocolate-pizza.jpg" },
    { name: "Delux Veg Pizza", price: 135, category: "Pizza", description: "Premium veggies and extra cheese", image: "/menu/veg-pizza.jpg" },
    { name: "MG's Special Pizza", price: 145, category: "Pizza", description: "Chef's special loaded pizza", image: "/menu/special-pizza.jpg" },

    // === BURGER ===
    { name: "Aloo Tikki Burger", price: 49, category: "Burger", description: "Classic potato patty burger", image: "/menu/burger.jpg" },
    { name: "Mix Veggie Burger", price: 59, category: "Burger", description: "Mixed vegetable patty", image: "/menu/burger.jpg" },
    { name: "Crunchy Burger", price: 65, category: "Burger", description: "Extra crispy patty", image: "/menu/burger.jpg" },
    { name: "Veg Cheese Burger", price: 65, category: "Burger", description: "Loaded with cheese slice", image: "/menu/burger.jpg" },
    { name: "Corn Burger", price: 69, category: "Burger", description: "Sweet corn patty burger", image: "/menu/burger.jpg" },
    { name: "Maharaja Burger", price: 75, category: "Burger", description: "Double patty giant burger", image: "/menu/burger.jpg" },
    { name: "MG's Special Burger", price: 80, category: "Burger", description: "Our signature special burger", image: "/menu/burger.jpg" },

    // === PASTA & MAGGIE ===
    { name: "Red Pasta", price: 119, category: "Pasta", description: "Tangy tomato sauce pasta", image: "/menu/red-pasta.jpg" },
    { name: "White Pasta", price: 119, category: "Pasta", description: "Creamy white sauce pasta", image: "/menu/white-pasta.jpg" },
    { name: "Plain Maggie", price: 49, category: "Maggie", description: "Classic masala maggie", image: "/menu/maggi.jpg" },
    { name: "Cheese Maggie", price: 59, category: "Maggie", description: "Maggie loaded with cheese", image: "/menu/maggi.jpg" },

    // === SANDWICH & TOAST ===
    { name: "Regular Cheese Sandwich", price: 49, category: "Sandwich", description: "Simple cheese sandwich", image: "/menu/sandwich.jpg" },
    { name: "Chocolate Sandwich", price: 49, category: "Sandwich", description: "Grilled with chocolate spread", image: "/menu/chocolate-sandwich.jpg" },
    { name: "Veg Cheese Sandwich", price: 55, category: "Sandwich", description: "Veggies and cheese grilled", image: "/menu/sandwich.jpg" },
    { name: "Jeera Toast", price: 39, category: "Sandwich", description: "Butter toast with cumin", image: "/menu/toast.jpg" },
    { name: "Grill Toast", price: 55, category: "Sandwich", description: "Crispy grilled butter toast", image: "/menu/toast.jpg" },
    { name: "Regular Sandwich Toast", price: 59, category: "Sandwich", description: "Classic toasted sandwich", image: "/menu/sandwich.jpg" },
    { name: "Masala Toast", price: 59, category: "Sandwich", description: "Spicy potato filling toast", image: "/menu/sandwich.jpg" },
    { name: "Cheese Sandwich Toast", price: 69, category: "Sandwich", description: "Toasted with cheese filling", image: "/menu/sandwich.jpg" },
    { name: "Paneer Schezwan Toast", price: 69, category: "Sandwich", description: "Spicy paneer filling", image: "/menu/sandwich.jpg" },

    // === SNACKS (Fries, Nuggets, Momos) ===
    { name: "Plain Fries", price: 59, category: "Fries", description: "Salted crispy french fries", image: "/menu/fries.jpg" },
    { name: "Peri Peri Fries", price: 69, category: "Fries", description: "Spicy peri peri masala fries", image: "/menu/fries.jpg" },
    { name: "Tandoor Fries", price: 79, category: "Fries", description: "Tandoori flavored fries", image: "/menu/fries.jpg" },
    { name: "Potato Pops", price: 49, category: "Snacks", description: "Crispy potato bites", image: "/menu/nuggets.jpg" },
    { name: "Veg Nuggets", price: 59, category: "Snacks", description: "Golden fried veg nuggets", image: "/menu/nuggets.jpg" },
    { name: "Chilli Garlic Pops", price: 69, category: "Snacks", description: "Spicy garlic potato pops", image: "/menu/nuggets.jpg" },
    { name: "Cheese Corn Nuggets", price: 79, category: "Snacks", description: "Cheesy corn filling", image: "/menu/nuggets.jpg" },
    { name: "Potato Hips", price: 89, category: "Snacks", description: "Special potato snack", image: "/menu/nuggets.jpg" },
    { name: "Veg Momos", price: 79, category: "Momos", description: "Steamed veg dumplings", image: "/menu/momos.jpg" },
    { name: "Paneer Momos", price: 85, category: "Momos", description: "Paneer filled dumplings", image: "/menu/momos.jpg" },
    { name: "Schezwan Momos", price: 89, category: "Momos", description: "Spicy schezwan dumplings", image: "/menu/momos.jpg" },
    { name: "Cheese Corn Momos", price: 99, category: "Momos", description: "Cheesy corn dumplings", image: "/menu/momos.jpg" },

    // === SHAKES & HOT ===
    { name: "Cold Coffee", price: 59, category: "Shakes", description: "Classic blended cold coffee", image: "/menu/cold-coffee.jpg" },
    { name: "Chocolate Shake", price: 59, category: "Shakes", description: "Rich chocolate milk shake", image: "/menu/chocolate-shake.jpg" },
    { name: "Vanilla Milk Shake", price: 59, category: "Shakes", description: "Classic vanilla shake", image: "/menu/vanilla-shake.jpg" },
    { name: "Oreo Shake", price: 79, category: "Shakes", description: "Thick shake with Oreo crumbles", image: "/menu/oreo-shake.jpg" },
    { name: "Kit-Kat Shake", price: 79, category: "Shakes", description: "Crunchy KitKat shake", image: "/menu/kitkat-shake.jpg" },
    { name: "Cad-B", price: 79, category: "Shakes", description: "Thick chocolate dessert shake", image: "/menu/chocolate-shake.jpg" },
    { name: "Strawberry Shake", price: 79, category: "Shakes", description: "Fresh strawberry flavor", image: "/menu/strawberry-shake.jpg" },
    { name: "Mango Shake", price: 79, category: "Shakes", description: "Seasonal mango shake", image: "/menu/mango-shake.jpg" },
    { name: "Biscoff Milk Shake", price: 89, category: "Shakes", description: "Lotus Biscoff premium shake", image: "/menu/biscoff-shake.jpg" },
    { name: "Tea", price: 20, category: "Hot", description: "Hot masala chai", image: "/menu/tea.jpg" },
    { name: "Hot Coffee", price: 30, category: "Hot", description: "Hot brewed coffee", image: "/menu/coffee.jpg" },
    { name: "Bournvita", price: 50, category: "Hot", description: "Hot chocolate malt drink", image: "/menu/bournvita.jpg" },

    // === MOCKTAILS ===
    { name: "Cool Blue", price: 69, category: "Mocktails", description: "Refreshing blue lagoon", image: "/menu/blue-mocktail.jpg" },
    { name: "Blue Berry Lime", price: 69, category: "Mocktails", description: "Berry and lime fizzy drink", image: "/menu/mocktail.jpg" },
    { name: "Strawberry Mint Mojito", price: 79, category: "Mocktails", description: "Minty strawberry refresher", image: "/menu/red-mocktail.jpg" },
    { name: "Bubblegum Mocktail", price: 79, category: "Mocktails", description: "Sweet bubblegum flavor", image: "/menu/mocktail.jpg" },
    { name: "Classic Mojito Mint", price: 79, category: "Mocktails", description: "Lemon and mint classic", image: "/menu/mojito.jpg" },
    { name: "Blue Blossom Mocktail", price: 79, category: "Mocktails", description: "Floral blue drink", image: "/menu/blue-mocktail.jpg" },
    { name: "Sunrise Mocktail", price: 89, category: "Mocktails", description: "Orange and pomegranate mix", image: "/menu/orange-mocktail.jpg" },
    { name: "Green Sea Mocktail", price: 89, category: "Mocktails", description: "Green apple cooler", image: "/menu/green-mocktail.jpg" },
    { name: "Rainbow Mocktail", price: 99, category: "Mocktails", description: "Multi-layered fruit drink", image: "/menu/rainbow-mocktail.jpg" },

    // === COMBOS ===
    { name: "Combo 1", price: 165, category: "Combos", description: "Mix Veg Burger + Fries + Cold Coffee", image: "/menu/combo.jpg" },
    { name: "Combo 2", price: 199, category: "Combos", description: "Veg Cheese Pizza + Potato Pops + Cold Coffee", image: "/menu/combo.jpg" },
    { name: "Couple Combo", price: 229, category: "Combos", description: "Veg Burger + Corn/Veg Pizza + Oreo Shake", image: "/menu/combo.jpg" },
    { name: "Party Combo", price: 399, category: "Combos", description: "Pizza + Momos + Burger + Pops + Fries + Coffee", image: "/menu/combo-big.jpg" },
  ];

  // --- 2. THE TABLES (1 to 6) ---
  const TABLES = [
    { tableNo: 1 }, { tableNo: 2 }, { tableNo: 3 }, 
    { tableNo: 4 }, { tableNo: 5 }, { tableNo: 6 }
  ];

  try {
    // Clear and Re-insert
    await MenuItem.deleteMany({});
    await MenuItem.insertMany(MENU_ITEMS);

    // Only add tables if none exist
    if ((await Table.countDocuments()) === 0) {
        await Table.insertMany(TABLES);
    }

    return NextResponse.json({ message: "Database Seeded with MG Cafe Menu! 🍔" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}