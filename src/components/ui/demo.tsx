"use client";
import React from "react";
import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
import { motion } from "motion/react";

const testimonials = [
  {
    text: "Just now I received the order. It's beautiful! Nice quality, happy to shop with you. Everything is very nice mam. Thank you.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vanitha",
    name: "Ms. Vanitha",
    role: "Verified Customer",
  },
  {
    text: "It is beautiful as expected. Happy with quality mam. I am really happy with the purchase.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rizwan",
    name: "Mrs. Rizwan",
    role: "Verified Customer",
  },
  {
    text: "Bangle trial taken, finishing is very good. Mangalsutra is also very good. Hopefully will see more soon.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amey",
    name: "Amey",
    role: "Jewelry Enthusiast",
  },
  {
    text: "Really nice product. Loved it much. Very nice product. High quality finish and elegant design.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sowmya",
    name: "Sowmya",
    role: "Verified Customer",
  },
  {
    text: "The sculptural gold bands are not just jewelry; they're wearable art that catches everyone's eye. So unique!",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    name: "Priya Lakshmi",
    role: "Fashion Blogger",
  },
  {
    text: "I was looking for minimalist statement pieces and found exactly that. The craftsmanship is flawless.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya",
    name: "Dr. Ananya",
    role: "Verified Customer",
  },
  {
    text: "The delivery was quick, and the unboxing experience was incredibly premium. These are modern classics.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kavitha",
    name: "Kavitha",
    role: "Verified Customer",
  },
  {
    text: "Absolutely stunning pieces! The ethereal opal ring has become my signature accessory.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Meera",
    name: "Meera",
    role: "Stylist",
  },
  {
    text: "I've never received so many compliments on my earrings before. The vintage ruby solitaire is amazing.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Deepa",
    name: "Deepa",
    role: "Verified Customer",
  },
  {
    text: "The necklace set is really superb mam. Heavy look and exact gold finishing. My friends asked if it is real gold. Thank you so much!",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priyadharshini",
    name: "Priyadharshini (Chennai)",
    role: "Bridal Customer",
  },
  {
    text: "Very neat packaging and prompt delivery within two days. The design is absolutely gorgeous. Highly recommended for bridal wear!",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Archana",
    name: "Dr. Archana (Coimbatore)",
    role: "Verified Customer",
  },
  {
    text: "Received the Xuping earrings today. The shine is incredible! It looks much better in person than in the photo. Extremely happy.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=KavithaR",
    name: "Kavitha R. (Trichy)",
    role: "Verified Customer",
  },
  {
    text: "The daily wear bangles are amazing. Using it for the past two weeks, no color change or fading even after contact with water. Super quality!",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Janani",
    name: "Janani Karthik (Madurai)",
    role: "Daily Wear User",
  },
  {
    text: "Bought a finger ring for my wife. She loved it! The stone setting is very premium and looks like real diamonds.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh",
    name: "Rajesh Kumar (Bangalore)",
    role: "Verified Buyer",
  },
  {
    text: "Beautiful collection! I ordered a neckpiece for my sister's wedding reception. It matched my silk saree perfectly.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Soundarya",
    name: "Soundarya (Salem)",
    role: "Saree Stylist",
  },
  {
    text: "Perfect packing, timely delivery, and premium quality. Trendy Glitterzz has become my go-to shop for imitation jewelry.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Suganya",
    name: "Suganya Devi (Tirunelveli)",
    role: "Verified Customer",
  },
  {
    text: "Thank you mam, got the parcel today. All items are safe. The matte finish choker is exceptionally beautiful. Will buy again!",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nithya",
    name: "Nithya Vignesh (Chennai)",
    role: "Verified Customer",
  },
  {
    text: "Amazing customer service. They helped me choose the right size for the bangles. The fit is perfect and polish is highly shiny.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=DeepaAnand",
    name: "Deepa Anand (Hyderabad)",
    role: "Verified Customer",
  },
  {
    text: "Trendy and elegant designs. Perfect for college girls and daily wear. The price is very affordable for this high level of quality.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Shalini",
    name: "Shalini (Vellore)",
    role: "College Student",
  },
  {
    text: "I am absolutely in love with the AD stone necklace! The sparkle is mind-blowing. Thank you Trendy Glitterzz.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Swetha",
    name: "Mrs. Swetha (Erode)",
    role: "Verified Customer",
  },
  {
    text: "Simply superb! The gold finish is very natural, not that bright artificial yellow. Highly satisfied with my purchase.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ramya",
    name: "Ramya (Thanjavur)",
    role: "Verified Customer",
  },
  {
    text: "Fast shipping and superb quality. The Xuping studs are perfect for office wear. Very light-weight and comfortable.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Divya",
    name: "Divya Prasad (Bangalore)",
    role: "Software Engineer",
  },
  {
    text: "Order received on time. The anti-tarnish jewelry is really anti-tarnish. Used it in hot summer, still looks brand new.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Preethi",
    name: "Preethi (Chennai)",
    role: "Verified Customer",
  },
  {
    text: "Extremely beautiful collection. I am regular customer now. The designs are very unique and modern.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Abirami",
    name: "Abirami (Pondicherry)",
    role: "Jewelry Collector",
  },
  {
    text: "Excellent quality. Same as shown in pictures. The customer service team is very polite and helpful. 5 stars!",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Gayatri",
    name: "Gayatri (Tiruppur)",
    role: "Verified Customer",
  },
  {
    text: "The kids' jewelry collection is very cute and safe for skin. My daughter loved the little flower earrings.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mythili",
    name: "Mythili (Coimbatore)",
    role: "Verified Customer",
  },
  {
    text: "I ordered a customized combo pack. The pricing is very reasonable and quality is outstanding. Thank you mam!",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bhuvana",
    name: "Bhuvana (Tuticorin)",
    role: "Verified Customer",
  },
  {
    text: "The Xuping bracelets have a rich look. It has a secure clasp which is very helpful. Love the micro plating finish.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Keerthana",
    name: "Keerthana (Chennai)",
    role: "Verified Customer",
  },
  {
    text: "Super collections mam! I am shocked by the quality for this budget. Keep up the good work.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Uma",
    name: "Uma Maheshwari (Madurai)",
    role: "Verified Customer",
  },
  {
    text: "Received my second order today. The packaging was bubble wrapped perfectly to avoid any damage. Outstanding care!",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kausalya",
    name: "Mrs. Kausalya (Trichy)",
    role: "Verified Customer",
  },
  {
    text: "Highly recommended! Perfect replica of gold jewelry. Best option for travel without worrying about safety.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vidhya",
    name: "Vidhya (Coimbatore)",
    role: "Frequent Traveler",
  },
  {
    text: "I am fully satisfied with the Kundan choker set. The stones are very shiny and design is highly traditional.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Subhashini",
    name: "Subhashini (Chennai)",
    role: "Traditional Wear Lover",
  },
  {
    text: "Trendy Glitterzz never disappoints! This is my 4th purchase and every time they deliver top-notch quality.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dharshini",
    name: "Dharshini (Salem)",
    role: "Repeat Buyer",
  },
  {
    text: "Very fast shipping to Kerala. The designer ear cuffs are extremely stylish and unique.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aishwarya",
    name: "Aishwarya (Kochi)",
    role: "Fashion Enthusiast",
  },
  {
    text: "The black beads mangalsutra is very elegant for daily wear. Extremely lightweight and sturdy.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hemalatha",
    name: "Hemalatha (Chennai)",
    role: "Daily Wear User",
  },
  {
    text: "Got so many compliments during the Diwali festival. Everyone thought it was real gold jewelry!",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Banumathy",
    name: "Mrs. Banumathy (Trichy)",
    role: "Verified Customer",
  },
  {
    text: "The Xuping finger rings are highly durable. Using it daily at office, still glowing.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Indhumathi",
    name: "Indhumathi (Bangalore)",
    role: "Corporate Employee",
  },
  {
    text: "Excellent finish. No irritation on skin, which is a major relief since I have highly sensitive skin.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kokila",
    name: "Kokila (Madurai)",
    role: "Sensitive Skin Buyer",
  },
  {
    text: "The antique gold finish long chain is simply majestic. Perfect for traditional silk sarees.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Shanthi",
    name: "Shanthi (Coimbatore)",
    role: "Saree Lover",
  },
  {
    text: "Very neat work. The pearls used are of premium quality. Totally worth the money.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Selvi",
    name: "Selvi (Salem)",
    role: "Verified Customer",
  },
  {
    text: "Beautiful and authentic designs. Excellent shopping experience. Will order more soon!",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anandhi",
    name: "Anandhi (Tiruppur)",
    role: "Verified Customer",
  },
  {
    text: "The Xuping earrings are my absolute favorite. They are so classy and match with both western and Indian wear.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Karpagam",
    name: "Karpagam (Chennai)",
    role: "Stylist",
  },
  {
    text: "Bought a traditional temple jewelry set. The carvings are very detailed and neat. Exceptional craftsmanship!",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Saraswathi",
    name: "Saraswathi (Madurai)",
    role: "Temple Jewelry Collector",
  },
  {
    text: "Great customer support on WhatsApp. They shared live videos of the product before shipping. So transparent!",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mahalakshmi",
    name: "Mahalakshmi (Trichy)",
    role: "Happy Customer",
  },
  {
    text: "The gold plated anklets are very strong. Design is simple and elegant. Happy customer!",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kiruthika",
    name: "Kiruthika (Chennai)",
    role: "Verified Customer",
  },
  {
    text: "Loved the packing box. It's very useful for storing the jewelry safely. Extremely thoughtful.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Durga",
    name: "Durga (Bangalore)",
    role: "Verified Customer",
  },
  {
    text: "The gemstone necklace is gorgeous. The colors are very vibrant and stones are fitted perfectly.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Revathi",
    name: "Revathi (Coimbatore)",
    role: "Verified Customer",
  },
  {
    text: "Very quick response from team. The delivery was fast even in rural areas. Thank you Trendy Glitterzz.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Gomathi",
    name: "Gomathi (Karur)",
    role: "Rural Customer Support",
  },
  {
    text: "Superb quality chokers. The thread is adjustable and very comfortable to wear. Excellent design.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chitra",
    name: "Chitra (Chennai)",
    role: "Verified Customer",
  },
  {
    text: "Highly satisfied with the product quality. The shine of the AD stones is brilliant.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nandhini",
    name: "Nandhini (Erode)",
    role: "Verified Customer",
  },
  {
    text: "The Matt finish bangles are super stylish. Fits perfectly and matches with my designer sarees.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anitha",
    name: "Anitha (Coimbatore)",
    role: "Saree Designer",
  },
  {
    text: "Best online shop for imitation jewelry. Safe payment options and regular tracking updates.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sandhya",
    name: "Sandhya (Chennai)",
    role: "Verified Customer",
  },
  {
    text: "I ordered a gift for my mother. She was extremely happy with the traditional look and quality. Thank you so much!",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vignesh",
    name: "Vignesh (Madurai)",
    role: "Gift Giver",
  },
  {
    text: "Perfect fit and finish. Looks incredibly classy. Perfect for party wear.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=RizwanGift",
    name: "Mrs. Rizwan (Chennai)",
    role: "Verified Customer",
  },
  {
    text: "Outstanding quality. Xuping is truly the best alternative to gold. Thanks for providing original Xuping items.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Suresh",
    name: "Suresh (Trichy)",
    role: "Xuping Collector",
  },
  {
    text: "Super fast shipping, got my parcel in 24 hours. The packaging was excellent.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dinesh",
    name: "Dinesh (Salem)",
    role: "Express Shipping User",
  },
  {
    text: "The jewelry finish is outstanding. No cheap plastic looks. Truly premium brand.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vijay",
    name: "Vijay (Chennai)",
    role: "Verified Customer",
  },
  {
    text: "Their AD stone collection is simply mindblowing. Excellent sparkle under party lights.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=AnanyaDr",
    name: "Dr. Ananya (Bangalore)",
    role: "Premium Buyer",
  },
  {
    text: "The vintage style solitaire ring is so beautiful. Wear it daily and it is still flawless.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=DeepaV",
    name: "Deepa (Chennai)",
    role: "Daily Wear User",
  },
  {
    text: "Loved the quality and weight. Feels heavy and premium. Excellent buying decision.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=AmeyW",
    name: "Amey (Mumbai)",
    role: "Jewelry Critic",
  },
  {
    text: "I am super happy with the purchase. The jewelry has a luxurious touch.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=MeeraSt",
    name: "Meera (Chennai)",
    role: "Fashion Stylist",
  },
  {
    text: "Ordered a complete bridal set. It looked incredibly grand. Fully satisfied.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=PriyadharshiniR",
    name: "Priyadharshini R. (Coimbatore)",
    role: "Bridal Wear",
  },
  {
    text: "Excellent variety. So many modern and traditional designs to choose from.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=ShaliniK",
    name: "Shalini K. (Trichy)",
    role: "Blogger",
  },
  {
    text: "Highly recommended for bridesmaids. We bought matching chokers and everyone loved it!",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=ArchanaS",
    name: "Archana S. (Chennai)",
    role: "Wedding Coordinator",
  },
  {
    text: "Best customer service. They helped with custom sizing for the traditional bangles.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=SuganyaC",
    name: "Suganya (Madurai)",
    role: "Customer First",
  },
  {
    text: "Very reliable brand. What you see in the video is exactly what you get.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=JananiR",
    name: "Janani (Tirunelveli)",
    role: "Verified Buyer",
  },
  {
    text: "The gold plating quality is superb. It doesn't leave any black marks on the skin.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=NithyaS",
    name: "Nithya (Chennai)",
    role: "Verified Buyer",
  },
  {
    text: "Highly impressed with the micro plated chains. Perfect for daily office wear.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=DeepaAB",
    name: "Deepa A. (Bangalore)",
    role: "Office Wear Enthusiast",
  },
  {
    text: "Very neat finishing. The stones are secure and don't fall off easily.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=SowmyaR",
    name: "Sowmya (Salem)",
    role: "Verified Customer",
  },
  {
    text: "Trendy Glitterzz is a game changer. Exceptional luxury jewelry at affordable prices.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaL",
    name: "Priya Lakshmi (Coimbatore)",
    role: "Saree Stylist",
  },
  {
    text: "Loved the Xuping collection. Original quality products. 100% recommended.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=KavithaV",
    name: "Kavitha (Chennai)",
    role: "Xuping Lover",
  },
  {
    text: "Super collection! Will definitely order more items in the future.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=AmeyC",
    name: "Amey (Coimbatore)",
    role: "Verified Buyer",
  },
  {
    text: "The traditional mango mala is very pretty. Exact gold finish look.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=GayathriM",
    name: "Gayathri (Trichy)",
    role: "Verified Customer",
  },
  {
    text: "Loved the premium box packaging. Feels like opening real gold jewelry.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=YaminiB",
    name: "Yamini (Bangalore)",
    role: "Verified Customer",
  },
  {
    text: "Best choice for weddings. Highly detailed finishing and looks very royal.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=KausalyaC",
    name: "Kausalya (Chennai)",
    role: "Verified Customer",
  },
  {
    text: "Fast delivery to Tiruppur. The Xuping Jhumkas are extremely cute and lightweight.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=KeerthanaT",
    name: "Keerthana (Tiruppur)",
    role: "Daily Wear User",
  },
  {
    text: "The antique short necklace is super. Looks very neat on silk sarees.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=VidhyaM",
    name: "Vidhya (Madurai)",
    role: "Traditional Stylist",
  },
  {
    text: "Excellent product quality. The micro plating is really good for daily use.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=SubhashiniC",
    name: "Subhashini (Chennai)",
    role: "Daily Wear User",
  },
  {
    text: "I am a repeat customer. They always maintain high standards of quality.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=DharshiniS",
    name: "Dharshini (Salem)",
    role: "Verified Customer",
  },
  {
    text: "Beautiful AD earrings. The stones shine like real diamonds.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=AishwaryaC",
    name: "Aishwarya (Coimbatore)",
    role: "Jewelry Lover",
  },
  {
    text: "Received the necklace set. High class finishing, extremely satisfied.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=HemalathaC",
    name: "Hemalatha (Chennai)",
    role: "Verified Customer",
  },
  {
    text: "Best gold imitation jewelry online. Prompt responses on WhatsApp.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=BanumathyT",
    name: "Banumathy (Trichy)",
    role: "Verified Customer",
  },
  {
    text: "Very stylish designs. Matches modern dresses as well as traditional wear.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=IndhumathiB",
    name: "Indhumathi (Bangalore)",
    role: "IT Professional",
  },
  {
    text: "Highly satisfied with the purchase. Beautiful stones and solid build quality.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=KokilaM",
    name: "Kokila (Madurai)",
    role: "Verified Customer",
  },
  {
    text: "The Lakshmi haram set is absolutely stunning. Perfect for temple visits.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=ShanthiC",
    name: "Shanthi (Coimbatore)",
    role: "Temple Visitor",
  },
  {
    text: "Excellent daily wear simple chains. Strong and elegant.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=SelviS",
    name: "Selvi (Salem)",
    role: "Daily Wear User",
  },
  {
    text: "Loved the packaging. They send a cute thank-you card as well. Very sweet!",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=AnandhiT",
    name: "Anandhi (Tiruppur)",
    role: "Happy Customer",
  },
  {
    text: "The Xuping bracelet is very glossy and smooth. Doesn't catch on clothes.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=KarpagamC",
    name: "Karpagam (Chennai)",
    role: "Stylist",
  },
  {
    text: "Extremely happy with the traditional bangle set. Perfect sizing guide.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=SaraswathiM",
    name: "Saraswathi (Madurai)",
    role: "Verified Customer",
  },
  {
    text: "Very fast shipping to Hosur. The product quality is beyond expectations.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=MahalakshmiH",
    name: "Mahalakshmi (Hosur)",
    role: "Verified Customer",
  },
  {
    text: "Very neat packing. Ideal for gifting. My friend loved the pendant!",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=KiruthikaC",
    name: "Kiruthika (Chennai)",
    role: "Verified Customer",
  },
  {
    text: "The black beads single line chain is very elegant. Fits perfectly.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=DurgaB",
    name: "Durga (Bangalore)",
    role: "Verified Customer",
  },
  {
    text: "Very high quality stones. The sparkle is amazing.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=RevathiC",
    name: "Revathi (Coimbatore)",
    role: "Verified Customer",
  },
  {
    text: "Excellent experience. Highly customer-friendly website and support.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=GomathiK",
    name: "Gomathi (Karur)",
    role: "Verified Customer",
  },
  {
    text: "The Xuping collection has amazing variety. The Polish is very long lasting.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=ChitraC",
    name: "Chitra (Chennai)",
    role: "Regular Wear",
  },
  {
    text: "Really beautiful products. Trendy Glitterzz has amazing customer loyalty.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=NandhiniE",
    name: "Nandhini (Erode)",
    role: "Loyal Customer",
  },
  {
    text: "The Matte finish Jhumkas are very trendy. Got many compliments at college.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=AnithaC",
    name: "Anitha (Coimbatore)",
    role: "Student",
  },
  {
    text: "Super quality products, fast delivery and very reasonable price. Must buy!",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=SandhyaC",
    name: "Sandhya (Chennai)",
    role: "Verified Customer",
  },
  {
    text: "The gold plated rings are perfect. Adjustable size is very convenient.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=VigneshM",
    name: "Vignesh (Madurai)",
    role: "Gift Buyer",
  },
  {
    text: "Very polite support staff. They helped me track my package closely.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=RizwanC",
    name: "Mrs. Rizwan (Chennai)",
    role: "Verified Customer",
  },
  {
    text: "Outstanding shine on the Xuping rings. Highly satisfied with my order.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=SureshT",
    name: "Suresh (Trichy)",
    role: "Verified Customer",
  }
];

const len = testimonials.length;
const firstColumn = testimonials.slice(0, Math.ceil(len / 3));
const secondColumn = testimonials.slice(Math.ceil(len / 3), Math.ceil((2 * len) / 3));
const thirdColumn = testimonials.slice(Math.ceil((2 * len) / 3));

export const Testimonials = () => {
  return (
    <section className="bg-alabaster/50 my-20 relative overflow-hidden">
      <div className="container z-10 mx-auto px-6">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
           viewport={{ once: true }}
           className="flex flex-col items-center justify-center max-w-[540px] mx-auto text-obsidian"
        >


          <h2 className="text-3xl md:text-5xl font-serif tracking-tighter text-center">
            What our clients say
          </h2>

        </motion.div>

        <div className="flex justify-center gap-6 mt-16 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] h-[650px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={20} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={25} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={22} />
        </div>
      </div>
    </section>
  );
};
