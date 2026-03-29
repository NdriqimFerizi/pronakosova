require('dotenv').config();
const mongoose=require('mongoose'),bcrypt=require('bcryptjs'),slugify=require('slugify');
const User=require('../models/User'),Listing=require('../models/Listing'),Builder=require('../models/Builder');
const connectDB=require('../config/db');
const slug=(title)=>slugify(title,{lower:true,strict:true})+'-'+Date.now();
(async()=>{
  await connectDB();
  await Promise.all([User.deleteMany(),Listing.deleteMany(),Builder.deleteMany()]);
  console.log('🗑  Cleared');
  const hash=await bcrypt.hash('password123',12);
  const [admin,co1,co2,seller]=await User.insertMany([
    {name:'Admin PronaKosova',email:'admin@pronakosova.com',password:hash,accountType:'seller',role:'admin',city:'Prishtinë',isVerified:true},
    {name:'Albatros Construction',email:'info@albatros.ks',password:hash,accountType:'company',companyName:'Albatros Construction',city:'Prishtinë',isVerified:true},
    {name:'EuroHousing Kosovo',email:'info@eurohousing.ks',password:hash,accountType:'company',companyName:'EuroHousing Kosovo',city:'Prizren',isVerified:true},
    {name:'Artan Krasniqi',email:'artan@email.com',password:hash,accountType:'seller',city:'Prishtinë',phone:'+383 44 123 456',isVerified:true},
  ]);
  console.log('👥 4 users');
  const [b1,b2]=await Builder.insertMany([
    {name:'Albatros Construction',description:'15 vjet eksperiencë.',phone:'+383 44 111 222',email:'info@albatros.ks',cities:['Prishtinë','Ferizaj'],owner:co1._id,isVerified:true,featured:true,foundedYear:2008},
    {name:'EuroHousing Kosovo',description:'Standarde europiane.',phone:'+383 44 333 444',email:'info@eurohousing.ks',cities:['Prizren','Pejë'],owner:co2._id,isVerified:true,featured:true,foundedYear:2012},
    {name:'Prizren Invest Group',description:'Zhvillues patundshmërish.',phone:'+383 29 555 666',email:'info@prizreninvest.ks',cities:['Prizren'],owner:admin._id,isVerified:true,foundedYear:2015},
  ]);
  console.log('🏗  3 builders');
  await Listing.insertMany([
    {slug:slug('Apartament Modern 3+1 ne Qender te Prishtines'),title:'Apartament Modern 3+1 në Qendër të Prishtinës',description:'Apartament i ri me pamje mbi qytet. Kati 5, lift, parking.',listingType:'shitet',propertyType:'apartament',price:145000,city:'Prishtinë',neighborhood:'Qendra',area:110,rooms:3,bathrooms:2,floor:5,yearBuilt:2022,parking:true,furnished:'plotesisht-mobiluar',amenities:{elevator:true,balcony:true,centralHeating:true,security:true},postedBy:seller._id,builder:b1._id,featured:true,images:[{url:'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',publicId:'seed_1'}]},
    {slug:slug('Shtepi 4+1 me Kopsht ne Arberi'),title:'Shtëpi 4+1 me Kopsht në Arbëri',description:'Kopsht 200m², garazh, lagja Arbëria.',listingType:'me-qira',propertyType:'shtepi',price:850,priceType:'per-muaj',city:'Prishtinë',neighborhood:'Arbëria',area:180,rooms:4,bathrooms:2,yearBuilt:2018,parking:true,furnished:'gjysme-mobiluar',amenities:{garden:true,balcony:true},postedBy:seller._id,images:[{url:'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',publicId:'seed_2'}]},
    {slug:slug('Vile Luksoze me Pishinen Prizren'),title:'Vilë Luksoze me Pishinë në Prizren',description:'Pishinë, kopsht, pamje mbi kalanë.',listingType:'i-ri',propertyType:'vila',price:320000,city:'Prizren',neighborhood:'Qendra',area:280,rooms:5,bathrooms:3,yearBuilt:2023,parking:true,furnished:'plotesisht-mobiluar',negotiable:true,amenities:{pool:true,garden:true,security:true},postedBy:co2._id,builder:b2._id,featured:true,images:[{url:'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800',publicId:'seed_3'}]},
    {slug:slug('Zyre 95m2 me Parking ne Dardani'),title:'Zyrë 95m² me Parking në Dardani',description:'Kati 4, lift, parking, siguri 24/7.',listingType:'me-qira',propertyType:'zyre',price:1200,priceType:'per-muaj',city:'Prishtinë',neighborhood:'Dardania',area:95,floor:4,yearBuilt:2020,parking:true,amenities:{elevator:true,security:true,airConditioning:true,internetIncluded:true},postedBy:co1._id,builder:b1._id,images:[{url:'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',publicId:'seed_4'}]},
    {slug:slug('Apartament 2+1 ne Qender te Pejes'),title:'Apartament 2+1 në Qendër të Pejës',description:'Pranë parkut, ballkon, parking.',listingType:'shitet',propertyType:'apartament',price:68000,city:'Pejë',neighborhood:'Qendra',area:72,rooms:2,bathrooms:1,floor:2,yearBuilt:2021,parking:true,amenities:{elevator:true,balcony:true},postedBy:seller._id,images:[{url:'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',publicId:'seed_5'}]},
    {slug:slug('Parcele Ndertimore 500m2 ne Ferizaj'),title:'Parcelë Ndërtimore 500m² në Ferizaj',description:'Leje ndërtimi, rrugë e asfaltuar.',listingType:'shitet',propertyType:'toke',price:42000,city:'Ferizaj',neighborhood:'Periferia',area:500,postedBy:admin._id,images:[{url:'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',publicId:'seed_6'}]},
    {slug:slug('Apartament 1+1 me Qira ne Gjakove'),title:'Apartament 1+1 me Qira në Gjakovë',description:'Studio e mobiluar, internet i përfshirë.',listingType:'me-qira',propertyType:'apartament',price:280,priceType:'per-muaj',city:'Gjakovë',neighborhood:'Qendra',area:45,rooms:1,bathrooms:1,floor:1,yearBuilt:2019,furnished:'plotesisht-mobiluar',amenities:{internetIncluded:true,airConditioning:true},postedBy:seller._id,images:[{url:'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',publicId:'seed_7'}]},
    {slug:slug('Kompleks i Ri Panorama Mitrovice'),title:'Kompleks i Ri "Panorama" – Mitrovicë',description:'48 apartamente, parking nëntokësor, pishinë.',listingType:'i-ri',propertyType:'apartament',price:65000,city:'Mitrovicë',neighborhood:'Qendra',area:55,rooms:2,bathrooms:1,floor:1,totalFloors:8,yearBuilt:2024,parking:true,amenities:{elevator:true,pool:true,security:true,centralHeating:true},postedBy:co1._id,builder:b1._id,featured:true,images:[{url:'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800',publicId:'seed_8'}]},
  ]);
  console.log('🏠 8 listings');
  console.log('\n✅ Seed done!\n');
  console.log('admin@pronakosova.com  / password123');
  console.log('info@albatros.ks       / password123');
  console.log('artan@email.com        / password123\n');
  process.exit(0);
})().catch(e=>{console.error('❌',e);process.exit(1);});
