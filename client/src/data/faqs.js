// Shared by the Home page (first few) and the full FAQ page.
export const FAQ_GROUPS = [
  {
    title: 'Pricing & quotes',
    items: [
      { q: 'How is my moving quote calculated?', a: 'We combine a vehicle base fare, the distance between your pickup and drop areas, labour & packing for your home size, stair charges if there is no lift, and optional premium packing or insurance. GST (18%) is shown separately. There are no hidden costs.' },
      { q: 'Is the online price final?', a: 'Yes, for the details you entered. The price is recalculated and locked when you book. It only changes if the actual move differs from what was booked, for example a bigger home size or extra floors without a lift, and our crew will confirm any change with you before loading.' },
      { q: 'Do I pay in advance?', a: 'No. Booking online is free and confirms your slot instantly. Payment is collected after delivery by UPI, card, net-banking or cash.' },
      { q: 'What does transit insurance cover?', a: 'Transit insurance (3% of the move value) covers damage or loss of goods during loading, transport and unloading. Report any damage on the delivery day and our claims team will get in touch within 48 hours.' },
    ],
  },
  {
    title: 'Booking & scheduling',
    items: [
      { q: 'Can I book a moving cab for today?', a: 'Yes. If cabs are available in your pickup area you can book instantly for today or any date up to a year ahead, and you get a booking ID right away.' },
      { q: 'Which areas do you serve?', a: 'See the Service Areas page for the live list. Our operations team adds new areas regularly, and you can check any pincode instantly.' },
      { q: 'How do I track my move?', a: 'Enter your booking ID on the Track page, or open My Moves after logging in. Every status update from our team shows up with a timestamp, and we email you when the status changes.' },
      { q: 'Can I cancel or reschedule a booking?', a: 'You can cancel free of charge from My Moves until a vehicle has picked up your goods. To reschedule, call us or send an inquiry with your booking ID and we will move your slot.' },
    ],
  },
  {
    title: 'Packing & moving day',
    items: [
      { q: 'Do you provide packing material?', a: 'Yes. Cartons, bubble wrap, stretch film and tape are included in the labour & packing charge. Premium packing adds corrugated sheets and wooden crates for glass, electronics and antiques.' },
      { q: 'What items can you not move?', a: 'We cannot carry cash, jewellery, important documents, flammable or hazardous materials (gas cylinders must be empty), perishable food, plants restricted by state rules or anything illegal. Please keep valuables with you.' },
      { q: 'Do you dismantle and re-assemble furniture?', a: 'Yes. Beds, wardrobes, tables and modular furniture are dismantled at pickup and re-assembled at your new home at no extra cost.' },
      { q: 'Can you move my car or bike?', a: 'Yes, through our Vehicle Transport service in enclosed carriers. Get a quote from the Services page or send us an inquiry.' },
    ],
  },
];

export const FAQS = FAQ_GROUPS.flatMap((g) => g.items);
