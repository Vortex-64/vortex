import React, { useState, useEffect, useRef } from "react";

// ─── FIREBASE ─────────────────────────────────────────────────────────────────
const FB_CONFIG = {
  apiKey: "AIzaSyBULPLaPLq9o73TlMzPuoyuQg1WVyrONrE",
  authDomain: "vortex-64.firebaseapp.com",
  projectId: "vortex-64",
  storageBucket: "vortex-64.firebasestorage.app",
  messagingSenderId: "236941609739",
  appId: "1:236941609739:web:76f50f6728522bed72b00e",
  measurementId: "G-K2ZBH030M6"
};

let fbApp=null, fbAuth=null, fbDb=null;

async function loadFirebase(){
  if(fbApp)return;
  await Promise.all([
    loadScript("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"),
    loadScript("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js"),
    loadScript("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js"),
  ]);
  fbApp=window.firebase.initializeApp(FB_CONFIG);
  fbAuth=window.firebase.auth();
  fbDb=window.firebase.firestore();
}

function loadScript(src){
  return new Promise((res,rej)=>{
    if(document.querySelector(`script[src="${src}"]`)){res();return;}
    const s=document.createElement("script");
    s.src=src;s.onload=res;s.onerror=rej;
    document.head.appendChild(s);
  });
}

// ─── SCHOOL DATA ──────────────────────────────────────────────────────────────
const NSW_SCHOOLS = [
  { name: "North Sydney Boys High School", mean: 94, std: 7, rank: 1, sr: 71.6 },
  { name: "James Ruse Agricultural High School", mean: 94, std: 7, rank: 2, sr: 70.43 },
  { name: "Sydney Grammar School", mean: 92, std: 7, rank: 3, sr: 60.99 },
  { name: "North Sydney Girls High School", mean: 92, std: 7, rank: 4, sr: 60.46 },
  { name: "Normanhurst Boys High School", mean: 91, std: 7, rank: 5, sr: 57.73 },
  { name: "Sydney Boys High School", mean: 91, std: 7, rank: 6, sr: 54.19 },
  { name: "Baulkham Hills High School", mean: 90, std: 7, rank: 7, sr: 51.53 },
  { name: "Hornsby Girls High School", mean: 90, std: 7, rank: 8, sr: 51.05 },
  { name: "St Aloysius' College", mean: 90, std: 7, rank: 9, sr: 48.03 },
  { name: "Reddam House", mean: 89, std: 7, rank: 10, sr: 46.99 },
  { name: "Abbotsleigh", mean: 89, std: 7, rank: 11, sr: 45.58 },
  { name: "Ascham School", mean: 89, std: 7, rank: 12, sr: 45.43 },
  { name: "Sydney Girls High School", mean: 89, std: 7, rank: 13, sr: 44.24 },
  { name: "Ravenswood School for Girls", mean: 89, std: 7, rank: 14, sr: 42.68 },
  { name: "Conservatorium High School", mean: 89, std: 7, rank: 15, sr: 42.55 },
  { name: "Presbyterian Ladies' College Sydney", mean: 88, std: 8, rank: 16, sr: 42.41 },
  { name: "Penrith Selective High School", mean: 88, std: 8, rank: 17, sr: 41.66 },
  { name: "Pymble Ladies' College", mean: 88, std: 8, rank: 18, sr: 40.63 },
  { name: "Roseville College", mean: 88, std: 8, rank: 19, sr: 40.58 },
  { name: "Fort Street High School", mean: 88, std: 8, rank: 20, sr: 40.2 },
  { name: "SCEGGS Darlinghurst", mean: 88, std: 8, rank: 21, sr: 39.02 },
  { name: "Merewether High School", mean: 88, std: 8, rank: 22, sr: 38.71 },
  { name: "Al-Faisal College Auburn", mean: 88, std: 8, rank: 23, sr: 38.59 },
  { name: "Meriden School", mean: 88, std: 8, rank: 24, sr: 38.11 },
  { name: "Northern Beaches Secondary College Manly Campus", mean: 88, std: 8, rank: 25, sr: 38.01 },
  { name: "Girraween High School", mean: 88, std: 8, rank: 26, sr: 37.83 },
  { name: "SHORE Sydney Church of England Grammar School", mean: 87, std: 8, rank: 27, sr: 37.59 },
  { name: "Alpha Omega Senior College", mean: 87, std: 8, rank: 28, sr: 36.07 },
  { name: "Knox Grammar School", mean: 87, std: 8, rank: 29, sr: 35.97 },
  { name: "Loreto Kirribilli", mean: 87, std: 8, rank: 30, sr: 35.44 },
  { name: "Caringbah High School", mean: 87, std: 8, rank: 31, sr: 34.36 },
  { name: "Queenwood", mean: 87, std: 8, rank: 32, sr: 34.1 },
  { name: "Gosford High School", mean: 87, std: 8, rank: 33, sr: 33.84 },
  { name: "Kincoppal-Rose Bay", mean: 87, std: 8, rank: 34, sr: 33.76 },
  { name: "Wenona School", mean: 87, std: 8, rank: 35, sr: 33.75 },
  { name: "Kambala", mean: 87, std: 8, rank: 36, sr: 33.7 },
  { name: "Northholm Grammar School", mean: 87, std: 8, rank: 37, sr: 33.2 },
  { name: "St Catherine's School Waverley", mean: 87, std: 8, rank: 38, sr: 33.14 },
  { name: "Tara Anglican School for Girls", mean: 86, std: 8, rank: 39, sr: 32.45 },
  { name: "Loreto Normanhurst", mean: 86, std: 8, rank: 40, sr: 31.35 },
  { name: "Al Noori Muslim School", mean: 86, std: 9, rank: 41, sr: 30.86 },
  { name: "The King's School", mean: 85, std: 9, rank: 42, sr: 30.82 },
  { name: "Hurlstone Agricultural High School", mean: 85, std: 9, rank: 43, sr: 29.39 },
  { name: "Parramatta Marist High School", mean: 85, std: 9, rank: 44, sr: 29.28 },
  { name: "St George Girls High School", mean: 85, std: 9, rank: 45, sr: 29.02 },
  { name: "Sydney Technical High School", mean: 85, std: 9, rank: 46, sr: 28.64 },
  { name: "Cranbrook School", mean: 85, std: 9, rank: 47, sr: 28.44 },
  { name: "Brigidine College St Ives", mean: 85, std: 9, rank: 48, sr: 27.87 },
  { name: "Monte Sant'Angelo Mercy College", mean: 85, std: 9, rank: 49, sr: 27.54 },
  { name: "Barker College", mean: 85, std: 9, rank: 50, sr: 27.51 },
  { name: "Emanuel School", mean: 85, std: 9, rank: 51, sr: 27.08 },
  { name: "Newington College", mean: 84, std: 9, rank: 52, sr: 26.86 },
  { name: "Brigidine College Randwick", mean: 84, std: 9, rank: 53, sr: 26.65 },
  { name: "Tangara School for Girls", mean: 84, std: 9, rank: 54, sr: 25.64 },
  { name: "The Illawarra Grammar School", mean: 84, std: 9, rank: 55, sr: 25.42 },
  { name: "Frensham School", mean: 84, std: 9, rank: 56, sr: 25.13 },
  { name: "Willoughby Girls High School", mean: 84, std: 9, rank: 57, sr: 24.97 },
  { name: "MLC School Burwood", mean: 84, std: 9, rank: 58, sr: 24.95 },
  { name: "Saint Ignatius' College", mean: 84, std: 9, rank: 59, sr: 24.94 },
  { name: "Moriah College", mean: 84, std: 9, rank: 60, sr: 24.82 },
  { name: "Newcastle Grammar School", mean: 84, std: 9, rank: 61, sr: 24.7 },
  { name: "Smiths Hill High School", mean: 84, std: 9, rank: 62, sr: 24.63 },
  { name: "Northern Beaches Secondary College Balgowlah Boys Campus", mean: 84, std: 9, rank: 63, sr: 24.5 },
  { name: "Chatswood High School", mean: 84, std: 9, rank: 64, sr: 24.12 },
  { name: "St Luke's Grammar School", mean: 84, std: 9, rank: 65, sr: 23.54 },
  { name: "St Vincent's College Potts Point", mean: 84, std: 9, rank: 66, sr: 23.54 },
  { name: "St Patrick's College Strathfield", mean: 83, std: 9, rank: 67, sr: 23.48 },
  { name: "Masada College", mean: 83, std: 9, rank: 68, sr: 23.36 },
  { name: "Marist Catholic College North Shore", mean: 83, std: 9, rank: 69, sr: 23.16 },
  { name: "Danebank Anglican School", mean: 83, std: 9, rank: 70, sr: 22.67 },
  { name: "St Augustine's College Sydney", mean: 83, std: 9, rank: 71, sr: 22.64 },
  { name: "St Joseph's College Hunters Hill", mean: 83, std: 9, rank: 72, sr: 22.47 },
  { name: "Cherrybrook Technology High School", mean: 83, std: 9, rank: 73, sr: 22.17 },
  { name: "St Andrew's Cathedral School", mean: 83, std: 9, rank: 74, sr: 22.12 },
  { name: "Cheltenham Girls High School", mean: 83, std: 9, rank: 75, sr: 22.06 },
  { name: "Mount St Benedict College", mean: 83, std: 9, rank: 76, sr: 22.05 },
  { name: "St Clare's College", mean: 83, std: 9, rank: 77, sr: 21.77 },
  { name: "Sefton High School", mean: 83, std: 9, rank: 78, sr: 21.53 },
  { name: "Santa Sabina College", mean: 83, std: 9, rank: 79, sr: 21.49 },
  { name: "Bethany College", mean: 83, std: 9, rank: 80, sr: 21.45 },
  { name: "The Scots College", mean: 83, std: 9, rank: 81, sr: 21.33 },
  { name: "Pittwater House Schools", mean: 83, std: 9, rank: 82, sr: 20.92 },
  { name: "Waverley College", mean: 83, std: 9, rank: 83, sr: 20.45 },
  { name: "International Grammar School", mean: 83, std: 9, rank: 84, sr: 20.34 },
  { name: "Georges River Grammar", mean: 83, std: 9, rank: 85, sr: 20.28 },
  { name: "Lindfield Learning Village", mean: 83, std: 9, rank: 86, sr: 20.27 },
  { name: "Oxley College Burradoo", mean: 82, std: 9, rank: 87, sr: 20.1 },
  { name: "St Mark's Coptic Orthodox College", mean: 82, std: 9, rank: 88, sr: 19.79 },
  { name: "Killarney Heights High School", mean: 82, std: 9, rank: 89, sr: 19.59 },
  { name: "St Spyridon College", mean: 82, std: 9, rank: 90, sr: 19.56 },
  { name: "Central Coast Grammar School", mean: 82, std: 9, rank: 91, sr: 19.45 },
  { name: "Rose Bay Secondary College", mean: 82, std: 9, rank: 92, sr: 19.41 },
  { name: "Stella Maris College", mean: 82, std: 9, rank: 93, sr: 19.35 },
  { name: "Parramatta High School", mean: 82, std: 9, rank: 94, sr: 19.35 },
  { name: "Our Lady of Mercy College Parramatta", mean: 82, std: 9, rank: 95, sr: 19.31 },
  { name: "Cammeraygal High School", mean: 82, std: 9, rank: 96, sr: 18.93 },
  { name: "Newtown High School of the Performing Arts", mean: 82, std: 9, rank: 97, sr: 18.66 },
  { name: "Covenant Christian School", mean: 82, std: 9, rank: 98, sr: 18.36 },
  { name: "Marist Catholic College Penshurst", mean: 82, std: 9, rank: 99, sr: 18.16 },
  { name: "Epping Boys High School", mean: 82, std: 9, rank: 100, sr: 17.72 },
  { name: "Mercy Catholic College Chatswood", mean: 81, std: 10, rank: 101, sr: 17.67 },
  { name: "SCECGS Redlands", mean: 81, std: 10, rank: 102, sr: 17.55 },
  { name: "St Ursula's College Kingsgrove", mean: 81, std: 10, rank: 103, sr: 17.44 },
  { name: "Redeemer Baptist School", mean: 81, std: 10, rank: 104, sr: 17.37 },
  { name: "St George Christian School", mean: 81, std: 10, rank: 105, sr: 17.35 },
  { name: "St Mary and St Mina's Coptic College", mean: 81, std: 10, rank: 106, sr: 17.24 },
  { name: "Aquinas Catholic College", mean: 80, std: 10, rank: 107, sr: 17.08 },
  { name: "Arden Anglican School", mean: 80, std: 10, rank: 108, sr: 17.05 },
  { name: "St Mary's Cathedral College", mean: 80, std: 10, rank: 109, sr: 16.85 },
  { name: "Christian Brothers' High School Lewisham", mean: 80, std: 10, rank: 110, sr: 16.72 },
  { name: "Macarthur Anglican School", mean: 80, std: 10, rank: 111, sr: 16.63 },
  { name: "Amity College Prestons", mean: 80, std: 10, rank: 112, sr: 16.4 },
  { name: "Northern Beaches Secondary College Mackellar Girls Campus", mean: 80, std: 10, rank: 113, sr: 16.33 },
  { name: "Strathfield Girls High School", mean: 80, std: 10, rank: 114, sr: 16.25 },
  { name: "Oxford Falls Grammar School", mean: 80, std: 10, rank: 115, sr: 16.2 },
  { name: "St John Bosco College", mean: 80, std: 10, rank: 116, sr: 16.17 },
  { name: "Trinity Grammar School", mean: 80, std: 10, rank: 117, sr: 16.16 },
  { name: "Carlingford High School", mean: 80, std: 10, rank: 118, sr: 15.87 },
  { name: "Castle Hill High School", mean: 80, std: 10, rank: 119, sr: 15.77 },
  { name: "Freeman Catholic College", mean: 80, std: 10, rank: 120, sr: 15.69 },
  { name: "Al-Faisal College Liverpool", mean: 80, std: 10, rank: 121, sr: 15.53 },
  { name: "St Philip's Christian College Waratah", mean: 80, std: 10, rank: 122, sr: 15.41 },
  { name: "St Columba Anglican School", mean: 80, std: 10, rank: 123, sr: 15.37 },
  { name: "Rosebank College", mean: 80, std: 10, rank: 124, sr: 15.22 },
  { name: "Marist College Eastwood", mean: 80, std: 10, rank: 125, sr: 14.96 },
  { name: "Sydney Secondary College Blackwattle Bay Campus", mean: 80, std: 10, rank: 126, sr: 14.96 },
  { name: "St Scholastica's College", mean: 79, std: 10, rank: 127, sr: 14.43 },
  { name: "Marcellin College", mean: 79, std: 10, rank: 128, sr: 14.42 },
  { name: "The Hills Grammar School", mean: 79, std: 10, rank: 129, sr: 14.41 },
  { name: "Marist College Kogarah", mean: 79, std: 10, rank: 130, sr: 14.22 },
  { name: "Emmanuel Anglican College", mean: 79, std: 10, rank: 131, sr: 14.18 },
  { name: "St Charbel's College", mean: 79, std: 10, rank: 132, sr: 14.14 },
  { name: "St Pius X College Adamstown", mean: 79, std: 10, rank: 133, sr: 14.12 },
  { name: "Domremy Catholic College", mean: 79, std: 10, rank: 134, sr: 14.11 },
  { name: "St Patrick's College Sutherland", mean: 79, std: 10, rank: 135, sr: 14.01 },
  { name: "Xavier Catholic College Ballina", mean: 79, std: 10, rank: 136, sr: 13.89 },
  { name: "Oakhill College", mean: 79, std: 10, rank: 137, sr: 13.58 },
  { name: "Northern Beaches Secondary College Freshwater Senior Campus", mean: 79, std: 10, rank: 138, sr: 13.54 },
  { name: "Wollemi College", mean: 79, std: 10, rank: 139, sr: 13.5 },
  { name: "William Clarke College", mean: 79, std: 10, rank: 140, sr: 13.35 },
  { name: "Killara High School", mean: 79, std: 10, rank: 141, sr: 13.3 },
  { name: "Ryde Secondary College", mean: 79, std: 10, rank: 142, sr: 13.28 },
  { name: "Burwood Girls High School", mean: 79, std: 10, rank: 143, sr: 13.02 },
  { name: "Dulwich High School of Visual Arts and Design", mean: 79, std: 10, rank: 144, sr: 12.87 },
  { name: "St Patrick's Marist College", mean: 79, std: 10, rank: 147, sr: 12.59 },
  { name: "Asquith Girls High School", mean: 78, std: 10, rank: 148, sr: 12.45 },
  { name: "Cerdon College", mean: 78, std: 10, rank: 149, sr: 12.0 },
  { name: "Other / Not listed", mean: 72, std: 11, rank: 999, sr: 0 },
].sort((a,b)=>a.name==="Other / Not listed"?1:b.name==="Other / Not listed"?-1:a.name.localeCompare(b.name));

const HSC_SUBJECTS = [
  { name: "English Advanced", units: 2, scale: 1.0 },
  { name: "English Standard", units: 2, scale: 0.92 },
  { name: "English Extension 1", units: 1, scale: 1.08 },
  { name: "English Extension 2", units: 1, scale: 1.10 },
  { name: "Mathematics Advanced", units: 2, scale: 1.05 },
  { name: "Mathematics Extension 1", units: 2, scale: 1.14 },
  { name: "Mathematics Extension 2", units: 2, scale: 1.22 },
  { name: "Mathematics Standard 2", units: 2, scale: 0.94 },
  { name: "Mathematics Standard 1", units: 2, scale: 0.88 },
  { name: "Physics", units: 2, scale: 1.06 },
  { name: "Chemistry", units: 2, scale: 1.05 },
  { name: "Biology", units: 2, scale: 0.98 },
  { name: "Economics", units: 2, scale: 1.04 },
  { name: "Business Studies", units: 2, scale: 0.97 },
  { name: "Legal Studies", units: 2, scale: 0.98 },
  { name: "Modern History", units: 2, scale: 0.99 },
  { name: "Ancient History", units: 2, scale: 0.98 },
  { name: "Geography", units: 2, scale: 0.99 },
  { name: "Software Design & Development", units: 2, scale: 1.01 },
  { name: "Design & Technology", units: 2, scale: 0.96 },
  { name: "Visual Arts", units: 2, scale: 0.97 },
  { name: "Music 1", units: 2, scale: 0.97 },
  { name: "PDHPE", units: 2, scale: 0.95 },
  { name: "Engineering Studies", units: 2, scale: 1.02 },
  { name: "History Extension", units: 1, scale: 1.08 },
  { name: "Science Extension", units: 1, scale: 1.10 },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const GRADE_BANDS=[{label:"HD",min:85,color:"#00C896",bg:"rgba(0,200,150,0.12)"},{label:"DN",min:75,color:"#3B82F6",bg:"rgba(59,130,246,0.12)"},{label:"CR",min:65,color:"#F59E0B",bg:"rgba(245,158,11,0.12)"},{label:"PS",min:50,color:"#F97316",bg:"rgba(249,115,22,0.12)"},{label:"FL",min:0,color:"#EF4444",bg:"rgba(239,68,68,0.12)"}];
const getBand=m=>GRADE_BANDS.find(b=>m>=b.min)||GRADE_BANDS[4];
const getHSCBand=m=>{
  if(m>=90)return{label:"Band 6",color:"#00C896",bg:"rgba(0,200,150,0.12)"};
  if(m>=80)return{label:"Band 5",color:"#3B82F6",bg:"rgba(59,130,246,0.12)"};
  if(m>=70)return{label:"Band 4",color:"#F59E0B",bg:"rgba(245,158,11,0.12)"};
  if(m>=60)return{label:"Band 3",color:"#F97316",bg:"rgba(249,115,22,0.12)"};
  if(m>=50)return{label:"Band 2",color:"#FB923C",bg:"rgba(251,146,60,0.12)"};
  return{label:"Band 1",color:"#EF4444",bg:"rgba(239,68,68,0.12)"};
};
const calcWAM=courses=>{const v=courses.filter(c=>c.mark!==""&&c.uoc>0);if(!v.length)return null;return v.reduce((s,c)=>s+Number(c.mark)*c.uoc,0)/v.reduce((s,c)=>s+c.uoc,0);};
const aggregateToATAR=agg=>{const t=[[500,99.95],[490,99.9],[478,99.7],[465,99.5],[450,99.0],[435,98.5],[420,97.5],[405,96.0],[388,94.0],[370,91.5],[350,88.0],[328,84.0],[305,79.0],[280,73.0],[255,66.0],[228,58.0],[200,50.0],[170,41.0],[138,31.0],[105,21.0],[70,11.0],[35,4.0],[0,0.0]];for(let i=0;i<t.length-1;i++){const[a1,r1]=t[i],[a2,r2]=t[i+1];if(agg<=a1&&agg>=a2)return Math.min(99.95,r2+((agg-a2)/(a1-a2))*(r1-r2));}return 0;};
function invNorm(p){if(p<=0)return -4;if(p>=1)return 4;const a=[0,-39.697,220.946,-275.929,138.358,-30.665,2.507],b=[0,-54.476,161.586,-155.699,66.801,-13.281],c=[-0.00778,-0.3224,-2.4008,-2.5497,4.3747,2.9382],d=[0.00778,0.3225,2.4451,3.7544],pL=0.02425,pH=1-pL;if(p<pL){const q=Math.sqrt(-2*Math.log(p));return(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);}if(p<=pH){const q=p-0.5,r=q*q;return(((((a[1]*r+a[2])*r+a[3])*r+a[4])*r+a[5])*r+a[6])*q/(((((b[1]*r+b[2])*r+b[3])*r+b[4])*r+b[5])*r+1);}const q=Math.sqrt(-2*Math.log(1-p));return-(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);}
const estimateMod=(rank,cohort,school)=>{const pct=1-(rank-0.5)/cohort;const z=invNorm(Math.max(0.01,Math.min(0.99,pct)));return Math.max(0,Math.min(100,school.mean+z*school.std));};

// ─── THEME ────────────────────────────────────────────────────────────────────
const THEMES={
  dark:{bg:"#0f172a",surface:"#1e293b",border:"#334155",borderDark:"#475569",text:"#f1f5f9",textMid:"#94a3b8",textLight:"#64748b",accent:"#00C896",accentDark:"#00a87e",accentBg:"rgba(0,200,150,0.15)",navy:"#020617",navyMid:"#0f172a"},
};
const C={
  bg:"var(--c-bg)",surface:"var(--c-sf)",border:"var(--c-b)",borderDark:"var(--c-bd)",
  text:"var(--c-t)",textMid:"var(--c-tm)",textLight:"var(--c-tl)",
  accent:"var(--c-a)",accentDark:"var(--c-ad)",accentBg:"var(--c-ab)",
  navy:"var(--c-n)",navyMid:"var(--c-nm)",
};
const inp={background:C.bg,border:`1.5px solid ${C.border}`,borderRadius:"8px",color:C.text,padding:"10px 13px",fontSize:"14px",fontFamily:"inherit",outline:"none",width:"100%",boxSizing:"border-box",transition:"border-color 0.15s"};
const sel={...inp,cursor:"pointer"};
const card={background:C.bg,border:`1px solid ${C.border}`,borderRadius:"12px",overflow:"hidden"};
const cardH={padding:"13px 18px",borderBottom:`1px solid ${C.border}`,fontSize:"11px",letterSpacing:"0.15em",color:C.textMid,textTransform:"uppercase",fontWeight:"600"};
const lbl={fontSize:"11px",letterSpacing:"0.12em",color:C.textMid,textTransform:"uppercase",fontWeight:"600",marginBottom:"6px",display:"block"};
const btn={background:C.accent,color:"#fff",border:"none",borderRadius:"8px",padding:"11px 18px",fontSize:"14px",fontWeight:"600",cursor:"pointer",fontFamily:"inherit",transition:"background 0.15s"};
const hint={fontSize:"11px",color:C.textLight,marginTop:"4px"};
const g2={display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"};
const row={display:"flex",alignItems:"center",gap:"10px",padding:"11px 18px",borderBottom:`1px solid ${C.border}`};
const badge=(col,bg)=>({padding:"4px 10px",borderRadius:"6px",fontSize:"11px",fontWeight:"700",letterSpacing:"0.08em",background:bg||"#f3f4f6",color:col||C.textMid,display:"inline-block"});

// ─── WAM TAB ──────────────────────────────────────────────────────────────────
function WAMTab(){
  const[courses,setCourses]=useState([]);
  const[name,setName]=useState("");const[uoc,setUoc]=useState(6);const[mark,setMark]=useState("");
  const[target,setTarget]=useState("");const[remUOC,setRemUOC]=useState("");
  const[loaded,setLoaded]=useState(false);
  useEffect(()=>{try{const r=localStorage.getItem("wam_c");if(r)setCourses(JSON.parse(r));}catch{}setLoaded(true);},[]);
  useEffect(()=>{if(loaded)try{localStorage.setItem("wam_c",JSON.stringify(courses));}catch{};},[courses,loaded]);
  const add=()=>{if(mark===""||Number(mark)<0||Number(mark)>100)return;setCourses(p=>[...p,{id:Date.now(),name:name.trim()||`Course ${p.length+1}`,uoc,mark}]);setName("");setMark("");};
  const wam=calcWAM(courses);const band=wam!==null?getBand(Math.round(wam)):null;
  const totalUOC=courses.filter(c=>c.mark!=="").reduce((s,c)=>s+c.uoc,0);
  let needed=null;
  if(wam!==null&&target!==""&&remUOC!==""){const cur=courses.filter(c=>c.mark!=="").reduce((s,c)=>s+Number(c.mark)*c.uoc,0);needed=((Number(target)*(totalUOC+Number(remUOC)))-cur)/Number(remUOC);}
  return(
    <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
      <div style={{...card,border:`2px solid ${band?.color||C.border}`,background:band?.bg||C.surface,padding:"24px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{...lbl,marginBottom:"4px"}}>Current WAM</div>
            <div style={{fontSize:"56px",fontWeight:"800",lineHeight:1,color:band?.color||C.borderDark,letterSpacing:"-0.03em"}}>{wam!==null?wam.toFixed(2):"—"}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <span style={badge(band?.color,band?.bg)}>{band?.label||"—"}</span>
            <div style={{fontSize:"12px",color:C.textMid,marginTop:"6px"}}>{totalUOC} UOC completed</div>
          </div>
        </div>
      </div>
      <div style={g2}>
        <div style={{...card,padding:"16px"}}><div style={lbl}>Courses</div><div style={{fontSize:"28px",fontWeight:"700",color:C.text}}>{courses.length}</div></div>
        <div style={{...card,padding:"16px"}}><div style={lbl}>Highest mark</div><div style={{fontSize:"28px",fontWeight:"700",color:C.text}}>{courses.length?Math.max(...courses.map(c=>Number(c.mark))):"—"}</div></div>
      </div>
      <div style={card}>
        <div style={cardH}>My courses</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr auto auto auto",gap:"8px",padding:"14px 18px",borderBottom:`1px solid ${C.border}`}}>
          <input style={inp} placeholder="Course name" value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()}/>
          <select style={{...sel,width:"auto"}} value={uoc} onChange={e=>setUoc(Number(e.target.value))}>{[3,6,12].map(u=><option key={u} value={u}>{u} UOC</option>)}</select>
          <input style={{...inp,width:"70px"}} type="number" min="0" max="100" placeholder="Mark" value={mark} onChange={e=>setMark(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()}/>
          <button style={btn} onClick={add}>+ Add</button>
        </div>
        {courses.length===0
          ?<div style={{padding:"28px",textAlign:"center",color:C.textLight,fontSize:"14px"}}>Add your first course above</div>
          :courses.map(c=>(
            <div key={c.id} style={row}>
              <div style={{flex:1,fontSize:"14px",color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
              <div style={{fontSize:"12px",color:C.textMid,width:"44px",textAlign:"center"}}>{c.uoc} UOC</div>
              <div style={{fontSize:"15px",fontWeight:"700",color:getBand(Number(c.mark)).color,width:"36px",textAlign:"center"}}>{c.mark}</div>
              <button onClick={()=>setCourses(p=>p.filter(x=>x.id!==c.id))} style={{background:"none",border:"none",color:C.textLight,cursor:"pointer",fontSize:"18px",padding:"0 4px"}}>×</button>
            </div>
          ))}
      </div>
      <div style={card}>
        <div style={cardH}>What do I need?</div>
        <div style={{...g2,padding:"16px 18px"}}>
          <div><label style={lbl}>Target WAM</label><input style={inp} type="number" placeholder="e.g. 75" value={target} onChange={e=>setTarget(e.target.value)}/></div>
          <div><label style={lbl}>Remaining UOC</label><input style={inp} type="number" placeholder="e.g. 48" value={remUOC} onChange={e=>setRemUOC(e.target.value)}/></div>
        </div>
        {needed!==null&&<div style={{padding:"0 18px 16px",fontSize:"14px",color:C.textMid}}>
          {needed>100?<span style={{color:"#EF4444",fontWeight:"600"}}>Not achievable! Would need {needed.toFixed(1)}, exceeds 100.</span>
          :needed<0?<span style={{color:C.accent,fontWeight:"600"}}>Already there!</span>
          :<span>You need an average of <strong style={{color:getBand(Math.round(needed)).color}}>{needed.toFixed(1)}</strong> <span style={badge(getBand(Math.round(needed)).color,getBand(Math.round(needed)).bg)}>{getBand(Math.round(needed)).label}</span> across your remaining {remUOC} UOC.</span>}
        </div>}
        {wam===null&&<div style={{padding:"0 18px 16px",fontSize:"12px",color:C.textLight}}>Add at least one course to use the simulator.</div>}
      </div>
    </div>
  );
}

// ─── HSC TAB ──────────────────────────────────────────────────────────────────
function HSCTab(){
  const[assessment,setAssessment]=useState("");const[exam,setExam]=useState("");
  const[search,setSearch]=useState("");const[school,setSchool]=useState(null);const[showDrop,setShowDrop]=useState(false);
  const[rank,setRank]=useState("");const[cohort,setCohort]=useState("");const[target,setTarget]=useState(80);
  const hscMark=assessment!==""&&exam!==""?(Number(assessment)+Number(exam))/2:null;
  const hscBand=hscMark!==null?getHSCBand(hscMark):null;
  const filtered=search.length>0?(()=>{
    const q=search.toLowerCase();
    const starts=NSW_SCHOOLS.filter(s=>s.name.toLowerCase().startsWith(q));
    const contains=NSW_SCHOOLS.filter(s=>!s.name.toLowerCase().startsWith(q)&&s.name.toLowerCase().includes(q));
    return[...starts,...contains].slice(0,10);
  })():[];
  const canEst=school&&rank!==""&&cohort!==""&&Number(rank)>=1&&Number(cohort)>=Number(rank)&&Number(cohort)>0;
  const mod=canEst?estimateMod(Number(rank),Number(cohort),school):null;
  const needed=mod!==null?2*target-mod:null;
  const needBand=needed!==null&&needed>=0&&needed<=100?getHSCBand(Math.round(needed)):null;
  const nc=needed===null?null:needed>100?"#EF4444":needed<0?C.accent:needBand?.color;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
      <div style={{...card,border:`2px solid ${hscBand?.color||C.border}`,background:hscBand?.bg||C.surface,padding:"24px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{...lbl,marginBottom:"4px"}}>HSC Mark</div>
            <div style={{fontSize:"56px",fontWeight:"800",lineHeight:1,color:hscBand?.color||C.borderDark,letterSpacing:"-0.03em"}}>{hscMark!==null?hscMark.toFixed(1):"—"}</div>
          </div>
          {hscBand&&<span style={badge(hscBand.color,hscBand.bg)}>{hscBand.label}</span>}
        </div>
      </div>
      <div style={card}>
        <div style={cardH}>Calculate HSC mark</div>
        <div style={{...g2,padding:"16px 18px"}}>
          <div><label style={lbl}>Assessment Mark</label><input style={inp} type="number" min="0" max="100" placeholder="0–100" value={assessment} onChange={e=>setAssessment(e.target.value)}/><div style={hint}>School-based · 50% weight</div></div>
          <div><label style={lbl}>Exam Mark</label><input style={inp} type="number" min="0" max="100" placeholder="0–100" value={exam} onChange={e=>setExam(e.target.value)}/><div style={hint}>External exam · 50% weight</div></div>
        </div>
      </div>
      <div style={card}>
        <div style={cardH}>Rank estimator. What exam mark do I need?</div>
        <div style={{padding:"16px 18px",display:"flex",flexDirection:"column",gap:"14px"}}>
          <div style={{position:"relative"}}>
            <label style={lbl}>Your school ({NSW_SCHOOLS.length-1} NSW schools · 2025 data)</label>
            <input style={inp} placeholder="Search school name…" value={school?school.name:search}
              onChange={e=>{setSearch(e.target.value);setSchool(null);setShowDrop(true);}}
              onFocus={()=>setShowDrop(true)} onBlur={()=>setTimeout(()=>setShowDrop(false),160)}/>
            {showDrop&&filtered.length>0&&(
              <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,zIndex:200,background:C.bg,border:`1px solid ${C.border}`,borderRadius:"10px",overflow:"hidden",maxHeight:"260px",overflowY:"auto",boxShadow:"0 8px 24px rgba(0,0,0,0.12)"}}>
                {filtered.map(s=>(
                  <div key={s.name} onMouseDown={()=>{setSchool(s);setSearch("");setShowDrop(false);}}
                    style={{padding:"11px 16px",fontSize:"13px",cursor:"pointer",borderBottom:`1px solid ${C.border}`}}
                    onMouseEnter={e=>e.currentTarget.style.background=C.surface}
                    onMouseLeave={e=>e.currentTarget.style.background=C.bg}>
                    <div style={{color:C.text,fontWeight:"500"}}>{s.name}</div>
                    <div style={{fontSize:"11px",color:C.textMid,marginTop:"2px"}}>Rank #{s.rank} · {s.sr}% Band 6 · est. avg {s.mean}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={g2}>
            <div><label style={lbl}>Internal rank</label><input style={inp} type="number" min="1" placeholder="e.g. 3" value={rank} onChange={e=>setRank(e.target.value)}/></div>
            <div><label style={lbl}>Cohort size</label><input style={inp} type="number" min="1" placeholder="e.g. 25" value={cohort} onChange={e=>setCohort(e.target.value)}/></div>
          </div>
          <div style={{background:C.surface,borderRadius:"10px",padding:"16px",border:`1px solid ${C.border}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:"10px"}}>
              <label style={lbl}>Target HSC mark</label>
              <span style={{fontSize:"22px",fontWeight:"800",color:C.text}}>{target}</span>
            </div>
            <input type="range" min="50" max="100" step="1" value={target} onChange={e=>setTarget(Number(e.target.value))}
              style={{width:"100%",accentColor:C.accent,cursor:"pointer"}}/>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:"11px",color:C.textLight,marginTop:"4px"}}>
              <span>Band 2 · 50</span><span>Band 5 · 80</span><span>Band 6 · 100</span>
            </div>
          </div>
          {canEst&&(
            <div style={{...card,border:`2px solid ${nc||C.border}`,background:needBand?.bg||C.surface,padding:"18px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"12px"}}>
                <div>
                  <div style={{...lbl,marginBottom:"3px"}}>Est. moderated assessment</div>
                  <div style={{fontSize:"22px",fontWeight:"700",color:"#3B82F6",marginBottom:"14px"}}>{mod.toFixed(1)}</div>
                  <div style={{...lbl,marginBottom:"3px"}}>Exam mark needed for HSC {target}</div>
                  {needed>100?<div style={{fontSize:"40px",fontWeight:"800",color:"#EF4444"}}>Not possible</div>
                  :needed<0?<div style={{fontSize:"40px",fontWeight:"800",color:C.accent}}>Already there</div>
                  :<div style={{fontSize:"48px",fontWeight:"800",color:nc,lineHeight:1}}>{needed.toFixed(1)}</div>}
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:"6px",alignItems:"flex-end"}}>
                  {needBand&&<span style={badge(needBand.color,needBand.bg)}>{needBand.label}</span>}
                  <div style={{fontSize:"11px",color:C.textMid,textAlign:"right"}}>Rank {rank}/{cohort}<br/>#{school.rank} · {school.sr}% Band 6</div>
                </div>
              </div>
              {needed>=0&&needed<=100&&(
                <div style={{marginTop:"14px"}}>
                  <div style={{height:"5px",background:C.border,borderRadius:"3px",overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${needed}%`,background:nc,borderRadius:"3px",transition:"width 0.3s"}}/>
                  </div>
                  <div style={{fontSize:"11px",color:C.textLight,marginTop:"4px"}}>Needed exam mark / 100</div>
                </div>
              )}
              {needed>100&&<div style={{marginTop:"10px",fontSize:"12px",color:"#EF4444"}}>Moderated mark ({mod.toFixed(1)}) too low! Improve your internal rank.</div>}
              {needed<0&&<div style={{marginTop:"10px",fontSize:"12px",color:C.accent}}>Your moderated mark ({mod.toFixed(1)}) alone exceeds {target}.</div>}
            </div>
          )}
          {!canEst&&<div style={{fontSize:"12px",color:C.textLight}}>Select your school and enter your rank + cohort to see your result.</div>}
        </div>
      </div>
      <div style={card}>
        <div style={cardH}>Band reference</div>
        <div style={{padding:"12px 18px",display:"flex",flexDirection:"column",gap:"6px"}}>
          {[{b:"Band 6",r:"90–100",c:"#00C896",bg:"rgba(0,200,150,0.10)"},{b:"Band 5",r:"80–89",c:"#3B82F6",bg:"rgba(59,130,246,0.10)"},{b:"Band 4",r:"70–79",c:"#F59E0B",bg:"rgba(245,158,11,0.10)"},{b:"Band 3",r:"60–69",c:"#F97316",bg:"rgba(249,115,22,0.10)"},{b:"Band 2",r:"50–59",c:"#FB923C",bg:"rgba(251,146,60,0.10)"},{b:"Band 1",r:"0–49",c:"#EF4444",bg:"rgba(239,68,68,0.10)"}].map(x=>(
            <div key={x.b} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",borderRadius:"8px",background:x.bg}}>
              <span style={{fontSize:"13px",fontWeight:"700",color:x.c}}>{x.b}</span>
              <span style={{fontSize:"12px",color:C.textMid}}>{x.r}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MATH RENDERER ────────────────────────────────────────────────────────────
function MathText({text,style={}}){
  const ref=useRef(null);
  useEffect(()=>{
    if(!ref.current)return;
    const render=()=>{
      if(window.renderMathInElement){
        window.renderMathInElement(ref.current,{
          delimiters:[
            {left:"$$",right:"$$",display:true},
            {left:"$",right:"$",display:false},
            {left:"\\(",right:"\\)",display:false},
            {left:"\\[",right:"\\]",display:true},
          ],
          throwOnError:false
        });
      }
    };
    if(window.renderMathInElement)render();
    else{const t=setInterval(()=>{if(window.renderMathInElement){render();clearInterval(t);}},200);return()=>clearInterval(t);}
  },[text]);
  return <span ref={ref} style={style}>{text}</span>;
}

// ─── DESMOS GRAPH ─────────────────────────────────────────────────────────────
function DesmosGraph({expressions=[]}){
  const ref=useRef(null);
  const calcRef=useRef(null);
  useEffect(()=>{
    const load=()=>{
      if(!ref.current||!window.Desmos)return;
      if(calcRef.current)calcRef.current.destroy();
      calcRef.current=window.Desmos.GraphingCalculator(ref.current,{
        expressions:false,settingsMenu:false,zoomButtons:true,
        border:false,lockViewport:false,
        backgroundColor:"transparent",
      });
      expressions.forEach((expr,i)=>{
        calcRef.current.setExpression({id:`e${i}`,latex:expr,color:i===0?"#00C896":i===1?"#3B82F6":"#F59E0B"});
      });
    };
    if(window.Desmos){load();return;}
    if(!document.getElementById("desmos-api")){
      const s=document.createElement("script");
      s.id="desmos-api";
      s.src="https://www.desmos.com/api/v1.9/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6";
      s.onload=load;
      document.head.appendChild(s);
    }else{
      const t=setInterval(()=>{if(window.Desmos){load();clearInterval(t);}},200);
      return()=>clearInterval(t);
    }
    return()=>{if(calcRef.current)calcRef.current.destroy();};
  },[expressions.join(",")]);
  return(
    <div style={{margin:"12px 20px",borderRadius:"12px",overflow:"hidden",border:"1px solid rgba(255,255,255,0.1)",height:"280px",background:"#1a2744"}}>
      <div ref={ref} style={{width:"100%",height:"100%"}}/>
    </div>
  );
}

// ─── AI CHECKER ──────────────────────────────────────────────────────────────
const TOPICS={
  "Mathematics Advanced":["Functions","Trigonometry","Calculus","Exponential & Logarithms","Financial Mathematics","Statistical Analysis","Networks"],
  "Mathematics Extension 1":["Further Functions","Trigonometric Equations","Inverse Trigonometry","Further Calculus","Combinatorics","Binomial Theorem","Vectors","Proof"],
  "Mathematics Extension 2":["Complex Numbers","Proof","Vectors (3D)","Integration Techniques","Mechanics","Further Inequalities"],
  "Mathematics Standard 2":["Algebra","Measurement","Financial Mathematics","Statistics","Networks"],
  "Physics":["Kinematics","Dynamics","Waves","Thermodynamics","Electricity","Modern Physics"],
  "Chemistry":["Atomic Structure","Bonding","Stoichiometry","Acids and Bases","Organic Chemistry","Equilibrium"],
  "University Maths 1":["Limits & Continuity","Differentiation","Integration","Sequences & Series","Vectors","Complex Numbers","Linear Systems","Differential Equations"],
  "University Maths 2":["Multivariable Calculus","Partial Derivatives","Multiple Integrals","Vector Calculus","Fourier Series","Laplace Transforms","Linear Algebra","Eigenvalues"],
  "University Physics":["Classical Mechanics","Electrostatics","Magnetism","Maxwell's Equations","Quantum Mechanics","Thermodynamics","Special Relativity","Waves & Optics"],
  "University Chemistry":["Thermodynamics","Chemical Kinetics","Quantum Chemistry","Electrochemistry","Spectroscopy","Organic Mechanisms","Coordination Chemistry","Statistical Mechanics"],
};

async function callClaude(system,user,maxTokens=1500){
  const res=await fetch("/.netlify/functions/claude",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:maxTokens,system,messages:[{role:"user",content:user}]})
  });
  if(!res.ok)throw new Error(`API error ${res.status}`);
  const data=await res.json();
  return data.content.find(b=>b.type==="text")?.text||"";
}

function parseJSON(raw){
  const cleaned=raw.replace(/```json\s*/g,"").replace(/```\s*/g,"").trim();
  const start=cleaned.indexOf("{");
  const end=cleaned.lastIndexOf("}");
  if(start===-1||end===-1)throw new Error("Response was cut off — try again");
  const slice=cleaned.slice(start,end+1);
  let inString=false,escaped=false,result="";
  for(let i=0;i<slice.length;i++){
    const ch=slice[i];
    if(escaped){result+=ch;escaped=false;continue;}
    if(ch==="\\"&&inString){result+=ch;escaped=true;continue;}
    if(ch==='"'){inString=!inString;result+=ch;continue;}
    if(inString&&(ch==="\n"||ch==="\r")){result+="\\n";continue;}
    result+=ch;
  }
  return JSON.parse(result);
}

function AICheckerTab({user}){
  const[mode,setMode]=useState("practice");
  const[courseType,setCourseType]=useState(null);
  const[course,setCourse]=useState("Mathematics Advanced");
  const[topic,setTopic]=useState("Calculus");
  const[difficulty,setDifficulty]=useState("Level 1");
  const[question,setQuestion]=useState(null);
  const[answer,setAnswer]=useState("");
  const[feedback,setFeedback]=useState(null);
  const[genLoading,setGenLoading]=useState(false);
  const[checkLoading,setCheckLoading]=useState(false);
  const[showSolution,setShowSolution]=useState(false);
  const[stats,setStats]=useState({attempted:0,correct:0,marksEarned:0,marksTotal:0});
  const[genError,setGenError]=useState(null);
  const[checkQ,setCheckQ]=useState("");
  const[checkWorking,setCheckWorking]=useState("");
  const[checkSubject,setCheckSubject]=useState("Mathematics Advanced");
  const[checkResult,setCheckResult]=useState(null);
  const[checkLoading2,setCheckLoading2]=useState(false);
  const[checkError,setCheckError]=useState(null);
  const[checkImage,setCheckImage]=useState(null);
  const[checkImageB64,setCheckImageB64]=useState(null);
  const[inputMode,setInputMode]=useState("type");
  const[visibleHints,setVisibleHints]=useState([]);

  const[displayText,setDisplayText]=useState("");
  const greetingBase=new Date().getHours()<12?"Good Morning":new Date().getHours()<17?"Good Afternoon":"Good Evening";
  const fullGreeting=user?.displayName?`${greetingBase}, ${user.displayName.split(" ")[0]}.`:`${greetingBase}.`;
  useEffect(()=>{
    setDisplayText("");
    let i=0;
    const t=setInterval(()=>{
      setDisplayText(fullGreeting.slice(0,i+1));
      i++;
      if(i>=fullGreeting.length)clearInterval(t);
    },45);
    return()=>clearInterval(t);
  },[fullGreeting]);
  const fileRef=useRef(null);
  const topics=TOPICS[course]||[];

  const generate=async()=>{
    setGenLoading(true);setQuestion(null);setFeedback(null);setAnswer("");setShowSolution(false);setGenError(null);setVisibleHints([]);
    try{
      const diffLabel=difficulty==="Level 1"?"easy (straightforward, single-step)":difficulty==="Level 2"?"medium (multi-step, requires some thinking)":"hard (challenging, exam-level, multi-part)";
      const isUni=course.startsWith("University");
      const system=`You are an expert ${isUni?`university undergraduate ${course.replace("University ","")}`:`NSW HSC ${course}`} question generator.
Generate a UNIQUE original exam-style question on: ${topic}. Difficulty: ${diffLabel}. ${isUni?"Pitch it at first or second year university level.":""}
IMPORTANT: Wrap ALL mathematical expressions in $ signs for LaTeX. For example: $x^2$, $\\sin(x)$, $\\frac{d}{dx}$, $\\sqrt{x}$.
If the question involves a function or graph, include a "graph" array with Desmos LaTeX expressions to plot (e.g. ["y=x^2", "y=2x+1"]). If no graph is needed, omit "graph" entirely.
Structure the question with up to 3 parts (a), (b), (c) if multi-step — Level 1 can be single part, Level 2 up to 2 parts, Level 3 up to 3 parts. Total marks max 8. Return ONLY valid JSON, no markdown, no extra text:
{"question":"question text with $math$. (a) part one $math$ (b) part two $math$ (c) part three $math$","marks":<int 1-8>,"parts":["(a) ...","(b) ...","(c) ..."],"graph":["desmos expression 1","desmos expression 2"],"hints":["hint with $math$"],"solution_steps":["Step 1: ... $math$"],"final_answer":"answer with $math$"}
Make it genuinely challenging and exam-authentic. Ensure the JSON is complete and properly closed. Be concise — keep solution_steps brief, max 4 steps.`;
      const raw=await callClaude(system,`Generate a ${diffLabel} question on ${topic} for ${course}.`,8000);
      setQuestion(parseJSON(raw));
    }catch(e){setGenError("Error: "+e.message);}
    setGenLoading(false);
  };

  const checkAnswer=async()=>{
    if(!question||!answer.trim())return;
    setCheckLoading(true);setFeedback(null);setShowSolution(false);
    try{
      const system=`You are a strict but fair NSW HSC mathematics marker.
The question was (${question.marks} marks): ${question.question}
Correct solution steps: ${question.solution_steps.join(" | ")}
Final answer: ${question.final_answer}
Evaluate the student's working step by step.
IMPORTANT: Wrap ALL mathematical expressions in $ signs for LaTeX rendering. For example: $x^2$, $\\frac{dy}{dx}$, $e^{2x}(1+2x)$.
Return ONLY valid JSON with no markdown and no trailing commas:
{"marks_awarded":0,"overall":"incorrect","feedback_lines":[{"type":"correct","text":"feedback here"}],"summary":"one sentence"}
The marks_awarded must be an integer from 0 to ${question.marks}. The overall field must be exactly one of: correct, partial, incorrect. Award marks fairly for correct method even if minor arithmetic slips.`;
      const raw=await callClaude(system,`Student's answer:\n${answer}`);
      const fb=parseJSON(raw);
      setFeedback(fb);
      setStats(s=>({
        attempted:s.attempted+1,
        correct:s.correct+(fb.overall==="correct"?1:0),
        marksEarned:s.marksEarned+Math.min(fb.marks_awarded,question.marks),
        marksTotal:s.marksTotal+question.marks
      }));
      if(user&&fbDb){
        try{
          await fbDb.collection("users").doc(user.uid).collection("attempts").add({
            course,topic,difficulty,
            question:question.question,
            questionObj:question,
            marks_awarded:Math.min(fb.marks_awarded,question.marks),
            marks_total:question.marks,
            overall:fb.overall,
            answer,
            timestamp:window.firebase.firestore.FieldValue.serverTimestamp()
          });
        }catch(e){console.log("Save failed:",e);}
      }
    }catch(e){setGenError("Marking failed: "+e.message);}
    setCheckLoading(false);
  };

  const handleImage=e=>{
    const file=e.target.files[0];if(!file)return;
    setCheckImage(file);
    const reader=new FileReader();
    reader.onload=ev=>setCheckImageB64(ev.target.result.split(",")[1]);
    reader.readAsDataURL(file);
  };

  const runCheckMode=async()=>{
    if(inputMode==="type"&&(!checkQ.trim()||!checkWorking.trim()))return;
    if(inputMode==="image"&&!checkImageB64)return;
    setCheckLoading2(true);setCheckResult(null);setCheckError(null);
    try{
      let working=checkWorking;
      if(inputMode==="image"&&checkImageB64){
        const raw=await fetch("/.netlify/functions/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
          model:"claude-sonnet-4-6",max_tokens:800,
          messages:[{role:"user",content:[
            {type:"image",source:{type:"base64",media_type:checkImage?.type||"image/jpeg",data:checkImageB64}},
            {type:"text",text:"Transcribe exactly what is written in this image. All maths, working steps. Plain text with line breaks only."}
          ]}]
        })});
        const d=await raw.json();
        working=d.content?.find(b=>b.type==="text")?.text||"";
        setCheckWorking(working);
      }
      const system=`You are an expert NSW HSC ${checkSubject} examiner with 15+ years experience.
Analyse the student's working rigorously. Return ONLY valid JSON, no markdown:
{"overall":"correct"|"error"|"incomplete","steps":[{"line":"student line","status":"correct"|"error"|"warning","feedback":"explanation"}],"summary":"2-3 sentence expert summary","finalAnswer":"correct final answer","examTip":"one HSC exam tip","commonMistake":"most common mistake for this question type"}`;
      const raw=await callClaude(system,`Subject: ${checkSubject}\nQuestion:\n${checkQ||"(no question)"}\nStudent working:\n${working}`);
      setCheckResult(parseJSON(raw));
    }catch(e){setCheckError("Error: "+e.message);}
    setCheckLoading2(false);
  };

  const sc=s=>s==="correct"?C.accent:s==="error"?"#EF4444":"#F59E0B";
  const sb=s=>s==="correct"?"rgba(0,200,150,0.07)":s==="error"?"rgba(239,68,68,0.07)":"rgba(245,158,11,0.07)";
  const fbColor=t=>t==="correct"?C.accent:t==="incorrect"?"#EF4444":t==="partial"?"#F59E0B":C.textMid;
  const fbBg=t=>t==="correct"?"rgba(0,200,150,0.06)":t==="incorrect"?"rgba(239,68,68,0.06)":t==="partial"?"rgba(245,158,11,0.06)":C.surface;
  const fbIcon=t=>t==="correct"?"✓":t==="incorrect"?"✗":t==="partial"?"~":"i";
  const pct=feedback&&question?feedback.marks_awarded/question.marks:0;
  const scoreColor=pct>=1?C.accent:pct>=0.5?"#F59E0B":"#EF4444";
  const acc=stats.attempted>0?Math.round(stats.correct/stats.attempted*100):null;

  return(
    <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
      <div style={{display:"flex",gap:"6px",background:"rgba(255,255,255,0.04)",padding:"4px",borderRadius:"10px",border:"1px solid rgba(255,255,255,0.08)"}}>
        {[{id:"practice",label:"Practice questions"},{id:"check",label:"Check my working"}].map(({id,label})=>(
          <button key={id} onClick={()=>setMode(id)} style={{flex:1,padding:"9px 0",borderRadius:"7px",border:"none",fontFamily:"inherit",fontSize:"13px",fontWeight:"600",cursor:"pointer",transition:"all 0.15s",
            background:mode===id?"rgba(255,255,255,0.08)":"transparent",
            color:mode===id?C.text:"rgba(255,255,255,0.4)"}}>
            {label}
          </button>
        ))}
      </div>

      {mode==="practice"&&(
        <div style={{minHeight:"520px",display:"flex",flexDirection:"column",position:"relative"}}>
          {stats.attempted>0&&(
            <div style={{display:"flex",gap:"24px",justifyContent:"center",marginBottom:"32px"}}>
              {[{n:stats.attempted,l:"attempted"},{n:stats.correct,l:"correct"},{n:`${stats.marksEarned}/${stats.marksTotal}`,l:"marks"},{n:acc!=null?acc+"%":"—",l:"accuracy"}].map(({n,l})=>(
                <div key={l} style={{textAlign:"center"}}>
                  <div style={{fontSize:"24px",fontWeight:"700",color:"#fff",fontFamily:"Georgia,serif",letterSpacing:"-0.02em"}}>{n}</div>
                  <div style={{fontSize:"11px",color:C.textLight,marginTop:"2px",letterSpacing:"0.1em",textTransform:"uppercase"}}>{l}</div>
                </div>
              ))}
            </div>
          )}

          {!question&&!genLoading&&(
            <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"60px 0 120px"}}>
              <div style={{fontSize:"48px",fontWeight:"400",color:C.text,fontFamily:"Georgia,serif",marginBottom:"16px",letterSpacing:"-0.02em",minHeight:"60px"}}>
                {displayText}<span style={{opacity:0.4,animation:"blink 1s step-end infinite"}}>|</span>
              </div>
              <style>{`@keyframes blink{0%,100%{opacity:0.4}50%{opacity:0}}`}</style>
              {!courseType&&(
                <div style={{marginTop:"12px",display:"flex",gap:"12px",justifyContent:"center"}}>
                  <button onClick={()=>{setCourseType("hsc");setCourse("Mathematics Advanced");setTopic(TOPICS["Mathematics Advanced"][0]);}}
                    style={{padding:"12px 28px",borderRadius:"12px",border:"1px solid rgba(255,255,255,0.12)",background:"rgba(255,255,255,0.06)",color:C.text,fontFamily:"Georgia,serif",fontSize:"16px",cursor:"pointer",transition:"all 0.15s"}}
                    onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.1)"}
                    onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"}>
                    HSC
                  </button>
                  <button onClick={()=>{setCourseType("uni");setCourse("University Maths 1");setTopic(TOPICS["University Maths 1"][0]);}}
                    style={{padding:"12px 28px",borderRadius:"12px",border:"1px solid rgba(255,255,255,0.12)",background:"rgba(255,255,255,0.06)",color:C.text,fontFamily:"Georgia,serif",fontSize:"16px",cursor:"pointer",transition:"all 0.15s"}}
                    onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.1)"}
                    onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"}>
                    University
                  </button>
                </div>
              )}
<HomeFeatures/>
              {courseType&&(
                <div style={{fontSize:"14px",color:C.textMid,lineHeight:1.7,maxWidth:"340px"}}>
                  Select your course and topic below, then hit the arrow to get a question.
                  <span onClick={()=>setCourseType(null)} style={{display:"block",marginTop:"8px",fontSize:"12px",color:C.textLight,cursor:"pointer",textDecoration:"underline"}}>Switch to {courseType==="hsc"?"University":"HSC"}</span>
                </div>
              )}
            </div>
          )}

          {genLoading&&(
            <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"60px 0 120px"}}>
              <div style={{fontSize:"32px",fontWeight:"400",color:C.textMid,fontFamily:"Georgia,serif",marginBottom:"12px",letterSpacing:"-0.01em"}}>Generating question…</div>
              <div style={{width:"200px",height:"2px",background:"rgba(255,255,255,0.08)",borderRadius:"1px",overflow:"hidden",marginTop:"8px"}}>
                <div style={{height:"100%",width:"60%",background:C.accent,borderRadius:"1px",animation:"slide 1.2s ease-in-out infinite"}}/>
              </div>
              <style>{`@keyframes slide{0%{transform:translateX(-120%)}100%{transform:translateX(280%)}}`}</style>
            </div>
          )}

          {genError&&<div style={{textAlign:"center",padding:"20px",color:"#f87171",fontSize:"14px"}}>{genError}</div>}

          {question&&!genLoading&&(
            <div style={{display:"flex",flexDirection:"column",gap:"16px",paddingBottom:"120px"}}>
              <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"16px",overflow:"hidden"}}>
                <div style={{padding:"14px 20px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",gap:"8px",flexWrap:"wrap",alignItems:"center"}}>
                  <span style={{fontSize:"11px",fontWeight:"600",padding:"3px 10px",borderRadius:"999px",background:"rgba(0,200,150,0.15)",color:C.accent,border:"1px solid rgba(0,200,150,0.2)"}}>{course.replace("Mathematics ","")}</span>
                  <span style={{fontSize:"11px",fontWeight:"600",padding:"3px 10px",borderRadius:"999px",background:"rgba(255,255,255,0.06)",color:C.textMid,border:"1px solid rgba(255,255,255,0.1)"}}>{topic}</span>
                  <span style={{fontSize:"11px",fontWeight:"600",padding:"3px 10px",borderRadius:"999px",background:difficulty==="Level 1"?"rgba(0,200,150,0.1)":difficulty==="Level 2"?"rgba(245,158,11,0.1)":"rgba(248,113,113,0.1)",color:difficulty==="Level 1"?C.accent:difficulty==="Level 2"?"#F59E0B":"#f87171",border:`1px solid ${difficulty==="Level 1"?"rgba(0,200,150,0.2)":difficulty==="Level 2"?"rgba(245,158,11,0.2)":"rgba(248,113,113,0.2)"}`}}>{difficulty}</span>
                  <span style={{fontSize:"11px",fontWeight:"600",padding:"3px 10px",borderRadius:"999px",background:"rgba(0,200,150,0.1)",color:C.accent,marginLeft:"auto"}}>{question.marks} mark{question.marks>1?"s":""}</span>
                </div>
                {question.parts?.length>0?(
  question.parts.map((part,i)=>(
    <div key={i} style={{padding:"16px 20px",borderBottom:i<question.parts.length-1?"1px solid rgba(255,255,255,0.06)":"none"}}>
      <div style={{fontSize:"11px",fontWeight:"700",color:C.accent,letterSpacing:"0.08em",marginBottom:"8px"}}>Part {["(a)","(b)","(c)"][i]}</div>
      <div style={{fontSize:"16px",color:C.text,lineHeight:1.85,fontFamily:"Georgia,serif"}}><MathText text={part}/></div>
    </div>
  ))
):(
  <div style={{padding:"20px",fontSize:"16px",color:C.text,lineHeight:1.85,fontFamily:"Georgia,serif"}}>
    <MathText text={question.question}/>
  </div>
)}
                {question.graph?.length>0&&<DesmosGraph expressions={question.graph}/>}
                {question.hints?.length>0&&(
                  <div style={{padding:"0 20px 16px",display:"flex",flexDirection:"column",gap:"8px"}}>
                    {question.hints.map((h,i)=>(
                      <div key={i}>
                        <button onClick={()=>setVisibleHints(p=>p.includes(i)?p.filter(x=>x!==i):[...p,i])}
                          style={{fontSize:"12px",color:visibleHints.includes(i)?"#fbbf24":"rgba(255,255,255,0.35)",padding:"5px 14px",border:`1px solid ${visibleHints.includes(i)?"rgba(251,191,36,0.3)":"rgba(255,255,255,0.1)"}`,borderRadius:"7px",cursor:"pointer",background:visibleHints.includes(i)?"rgba(251,191,36,0.06)":"transparent",fontFamily:"inherit",transition:"all 0.15s"}}>
                          {visibleHints.includes(i)?"Hide":"Show"} Hint {i+1}
                        </button>
                        {visibleHints.includes(i)&&(
                          <div style={{marginTop:"8px",padding:"12px 16px",background:"rgba(251,191,36,0.07)",border:"1px solid rgba(251,191,36,0.2)",borderRadius:"10px",fontSize:"14px",color:"#fbbf24",lineHeight:1.7}}>
                            <MathText text={h}/>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {!feedback&&(
                <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"16px",overflow:"hidden"}}>
                  <div style={{padding:"13px 20px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontSize:"11px",letterSpacing:"0.12em",color:C.textLight,textTransform:"uppercase",fontWeight:"600"}}>Your working and answer</div>
                    <div style={{fontSize:"11px",color:C.textLight,fontFamily:"monospace"}}>{answer.length} chars</div>
                  </div>
                  <textarea style={{width:"100%",minHeight:"160px",resize:"vertical",background:"transparent",border:"none",outline:"none",color:"rgba(255,255,255,0.85)",fontFamily:"'Courier New',monospace",fontSize:"14px",padding:"16px 20px",lineHeight:1.8,boxSizing:"border-box"}}
                    placeholder={"Show every step. Marks are awarded for method, not just the final answer.\n\nExample:\nLet u = sin(x), du = cos(x) dx\n∫ sin²(x)cos(x) dx = ∫ u² du = u³/3 + C"}
                    value={answer} onChange={e=>setAnswer(e.target.value)}/>
                  <div style={{padding:"12px 20px",borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",justifyContent:"flex-end"}}>
                    <button onClick={checkAnswer} disabled={checkLoading||answer.trim().length<3}
                      style={{padding:"9px 28px",borderRadius:"8px",border:"none",background:checkLoading||answer.trim().length<3?"rgba(255,255,255,0.08)":C.accent,color:checkLoading||answer.trim().length<3?"rgba(255,255,255,0.3)":"#fff",fontFamily:"inherit",fontSize:"14px",fontWeight:"600",cursor:checkLoading||answer.trim().length<3?"not-allowed":"pointer"}}>
                      {checkLoading?"Marking…":"Check answer →"}
                    </button>
                  </div>
                </div>
              )}

              {feedback&&(
                <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
                  <div style={{background:`rgba(${pct>=1?"0,200,150":pct>=0.5?"245,158,11":"248,113,113"},0.08)`,border:`1px solid rgba(${pct>=1?"0,200,150":pct>=0.5?"245,158,11":"248,113,113"},0.2)`,borderRadius:"16px",padding:"20px"}}>
                    <div style={{fontSize:"11px",letterSpacing:"0.12em",color:C.textLight,textTransform:"uppercase",fontWeight:"600",marginBottom:"8px"}}>Result</div>
                    <div style={{fontSize:"26px",fontWeight:"700",color:scoreColor,fontFamily:"Georgia,serif",marginBottom:"8px"}}>
                      {pct>=1?"Full marks ✓":pct>=0.5?"Partial credit ~":"Incorrect ✗"} {feedback.marks_awarded}/{question.marks}
                    </div>
                    <div style={{fontSize:"14px",color:C.textMid,lineHeight:1.7}}>{feedback.summary}</div>
                  </div>
                  <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"16px",overflow:"hidden"}}>
                    <div style={{padding:"13px 20px",borderBottom:"1px solid rgba(255,255,255,0.06)",fontSize:"11px",letterSpacing:"0.12em",color:C.textLight,textTransform:"uppercase",fontWeight:"600"}}>Feedback</div>
                    {feedback.feedback_lines?.map((fl,i)=>(
                      <div key={i} style={{display:"flex",gap:"12px",alignItems:"flex-start",padding:"12px 20px",borderBottom:"1px solid rgba(255,255,255,0.04)",background:fbBg(fl.type)}}>
                        <div style={{fontSize:"13px",fontWeight:"700",color:fbColor(fl.type),flexShrink:0,width:"16px"}}>{fbIcon(fl.type)}</div>
                        <div style={{fontSize:"13px",color:C.text,lineHeight:1.6}}><MathText text={fl.text}/></div>
                      </div>
                    ))}
                  </div>
                  <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"16px",overflow:"hidden"}}>
                    <button onClick={()=>setShowSolution(s=>!s)} style={{width:"100%",padding:"14px 20px",background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:"8px",fontFamily:"inherit",fontSize:"13px",fontWeight:"600",color:C.textLight,textAlign:"left"}}>
                      <span>{showSolution?"▼":"▶"}</span> {showSolution?"Hide":"View"} worked solution
                    </button>
                    {showSolution&&(
                      <div style={{padding:"16px 20px",borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",flexDirection:"column",gap:"12px"}}>
                        {question.solution_steps?.map((s,i)=>(
                          <div key={i}>
                            <div style={{fontSize:"11px",fontWeight:"600",color:C.accent,marginBottom:"4px",letterSpacing:"0.08em"}}>Step {i+1}</div>
                            <div style={{fontSize:"13px",color:C.textMid,lineHeight:1.7,fontFamily:"'Courier New',monospace"}}><MathText text={s}/></div>
                          </div>
                        ))}
                        <div style={{paddingTop:"12px",borderTop:"1px solid rgba(255,255,255,0.06)",fontSize:"14px"}}>
                          <span style={{color:C.textLight}}>Final answer: </span>
                          <span style={{fontWeight:"700",color:C.accent}}><MathText text={question.final_answer}/></span>
                        </div>
                      </div>
                    )}
                  </div>
                  <button onClick={generate} style={{padding:"12px",borderRadius:"12px",border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:C.textMid,fontFamily:"inherit",fontSize:"13px",fontWeight:"600",cursor:"pointer"}}>
                    Next question →
                  </button>
                </div>
              )}
            </div>
          )}

          {!feedback&&courseType&&(
            <div style={{position:"sticky",bottom:"-32px",marginTop:"auto",padding:"16px 0 8px",background:"linear-gradient(to top, rgba(15,23,42,1) 60%, rgba(15,23,42,0))"}}>
              <div style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px",padding:"12px 16px",display:"flex",alignItems:"center",gap:"12px",backdropFilter:"blur(12px)"}}>
                <div style={{display:"flex",flexDirection:"column",flex:1,minWidth:0}}>
                  <div style={{fontSize:"10px",color:C.textLight,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"4px"}}>{course.replace("Mathematics ","Maths ")}</div>
                  <div style={{display:"flex",gap:"8px",alignItems:"center",flexWrap:"wrap"}}>
                    <select value={course} onChange={e=>{setCourse(e.target.value);setTopic(TOPICS[e.target.value]?.[0]||"");}} style={{background:"transparent",border:"none",outline:"none",color:"rgba(255,255,255,0.8)",fontFamily:"Georgia,serif",fontSize:"14px",cursor:"pointer",maxWidth:"160px"}}>
                      {Object.keys(TOPICS).filter(c=>courseType==="uni"?c.startsWith("University"):!c.startsWith("University")).map(c=><option key={c} value={c} style={{background:"#0f172a"}}>{c}</option>)}
                    </select>
                    <span style={{color:C.textLight}}>·</span>
                    <select value={topic} onChange={e=>setTopic(e.target.value)} style={{background:"transparent",border:"none",outline:"none",color:C.textMid,fontFamily:"Georgia,serif",fontSize:"14px",cursor:"pointer",maxWidth:"160px"}}>
                      {topics.map(t=><option key={t} value={t} style={{background:"#0f172a"}}>{t}</option>)}
                    </select>
                    <span style={{color:C.textLight}}>·</span>
                    <select value={difficulty} onChange={e=>setDifficulty(e.target.value)} style={{background:"transparent",border:"none",outline:"none",color:C.textMid,fontFamily:"Georgia,serif",fontSize:"14px",cursor:"pointer"}}>
                      {["Level 1","Level 2","Level 3"].map(d=><option key={d} value={d} style={{background:"#0f172a"}}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={generate} disabled={genLoading}
                  style={{width:"44px",height:"44px",borderRadius:"10px",border:"none",background:genLoading?"rgba(255,255,255,0.1)":C.accent,color:genLoading?"rgba(255,255,255,0.3)":"#fff",fontSize:"20px",cursor:genLoading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {genLoading?"…":"›"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {mode==="check"&&<>
        <div style={{display:"flex",gap:"6px",background:"rgba(255,255,255,0.04)",padding:"4px",borderRadius:"10px",border:"1px solid rgba(255,255,255,0.08)"}}>
          {[{id:"type",label:"Type working"},{id:"image",label:"Upload photo"}].map(({id,label})=>(
            <button key={id} onClick={()=>setInputMode(id)} style={{flex:1,padding:"9px 0",borderRadius:"7px",border:"none",fontFamily:"inherit",fontSize:"13px",fontWeight:"600",cursor:"pointer",transition:"all 0.15s",
              background:inputMode===id?"rgba(255,255,255,0.08)":"transparent",
              color:inputMode===id?C.text:"rgba(255,255,255,0.4)"}}>
              {label}
            </button>
          ))}
        </div>
        <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"16px",overflow:"hidden"}}>
          <div style={{padding:"13px 20px",borderBottom:"1px solid rgba(255,255,255,0.06)",fontSize:"11px",letterSpacing:"0.12em",color:C.textLight,textTransform:"uppercase",fontWeight:"600"}}>Subject</div>
          <div style={{padding:"14px 20px"}}>
            <select style={{...inp,background:"transparent",color:"rgba(255,255,255,0.8)",border:"1px solid rgba(255,255,255,0.1)"}} value={checkSubject} onChange={e=>setCheckSubject(e.target.value)}>
              {["Mathematics Advanced","Mathematics Extension 1","Mathematics Extension 2","Mathematics Standard 2","Physics","Chemistry","Biology","Economics","Business Studies","Other"].map(s=><option key={s} value={s} style={{background:"#0f172a"}}>{s}</option>)}
            </select>
          </div>
        </div>
        <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"16px",overflow:"hidden"}}>
          <div style={{padding:"13px 20px",borderBottom:"1px solid rgba(255,255,255,0.06)",fontSize:"11px",letterSpacing:"0.12em",color:C.textLight,textTransform:"uppercase",fontWeight:"600"}}>Question <span style={{opacity:0.5,fontWeight:"400"}}>(optional)</span></div>
          <div style={{padding:"14px 20px"}}>
            <textarea style={{width:"100%",minHeight:"64px",resize:"vertical",background:"transparent",border:"none",outline:"none",color:"rgba(255,255,255,0.8)",fontFamily:"inherit",fontSize:"14px",lineHeight:1.6,boxSizing:"border-box"}} placeholder="e.g. Find the derivative of f(x) = x³ + 2x²" value={checkQ} onChange={e=>setCheckQ(e.target.value)}/>
          </div>
        </div>
        {inputMode==="type"?(
          <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"16px",overflow:"hidden"}}>
            <div style={{padding:"13px 20px",borderBottom:"1px solid rgba(255,255,255,0.06)",fontSize:"11px",letterSpacing:"0.12em",color:C.textLight,textTransform:"uppercase",fontWeight:"600"}}>Your working. One step per line</div>
            <textarea style={{width:"100%",minHeight:"180px",resize:"vertical",background:"transparent",border:"none",outline:"none",color:"rgba(255,255,255,0.85)",fontFamily:"'Courier New',monospace",fontSize:"14px",padding:"16px 20px",lineHeight:1.9,boxSizing:"border-box"}}
              placeholder={"f(x) = x³ + 2x² − 5x + 1\nf'(x) = 3x² + 4x − 5"}
              value={checkWorking} onChange={e=>setCheckWorking(e.target.value)}/>
          </div>
        ):(
          <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"16px",overflow:"hidden"}}>
            <div style={{padding:"13px 20px",borderBottom:"1px solid rgba(255,255,255,0.06)",fontSize:"11px",letterSpacing:"0.12em",color:C.textLight,textTransform:"uppercase",fontWeight:"600"}}>Upload photo of handwritten working</div>
            <div style={{padding:"16px 20px"}}>
              <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleImage}/>
              <div onClick={()=>fileRef.current?.click()} style={{border:`2px dashed ${checkImage?"rgba(0,200,150,0.4)":"rgba(255,255,255,0.1)"}`,borderRadius:"12px",padding:"28px",textAlign:"center",cursor:"pointer",background:checkImage?"rgba(0,200,150,0.04)":"transparent"}}>
                {checkImage?(
                  <div>
                    <img src={URL.createObjectURL(checkImage)} alt="working" style={{maxWidth:"100%",maxHeight:"180px",borderRadius:"8px",objectFit:"contain"}}/>
                    <div style={{marginTop:"8px",fontSize:"12px",color:C.accent,fontWeight:"600"}}>{checkImage.name}</div>
                  </div>
                ):(
                  <div>
                    <div style={{fontSize:"14px",fontWeight:"600",color:C.textMid,marginBottom:"4px"}}>Click to upload photo</div>
                    <div style={{fontSize:"12px",color:C.textLight}}>Vortex reads your handwriting and checks it</div>
                  </div>
                )}
              </div>
              {checkWorking&&checkImage&&(
                <div style={{marginTop:"12px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"10px",padding:"14px"}}>
                  <div style={{fontSize:"10px",letterSpacing:"0.12em",color:C.textLight,textTransform:"uppercase",fontWeight:"600",marginBottom:"8px"}}>Transcribed from your handwriting</div>
                  <div style={{fontSize:"13px",color:C.textMid,fontFamily:"'Courier New',monospace",lineHeight:1.8,whiteSpace:"pre-wrap"}}>{checkWorking}</div>
                </div>
              )}
            </div>
          </div>
        )}
        <button style={{width:"100%",padding:"14px",fontSize:"15px",fontWeight:"700",borderRadius:"12px",border:"none",
          background:checkLoading2?"rgba(255,255,255,0.08)":C.accent,color:checkLoading2?"rgba(255,255,255,0.3)":"#fff",
          cursor:checkLoading2?"not-allowed":"pointer",fontFamily:"inherit"}}
          onClick={runCheckMode} disabled={checkLoading2}>
          {checkLoading2?"Checking…":"Check my working →"}
        </button>
        {checkError&&<div style={{padding:"14px",borderRadius:"12px",border:"1px solid rgba(248,113,113,0.3)",background:"rgba(248,113,113,0.06)",fontSize:"13px",color:"#f87171"}}>{checkError}</div>}
        {checkResult&&(
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            <div style={{background:`rgba(${checkResult.overall==="correct"?"0,200,150":checkResult.overall==="error"?"248,113,113":"245,158,11"},0.08)`,border:`1px solid rgba(${checkResult.overall==="correct"?"0,200,150":checkResult.overall==="error"?"248,113,113":"245,158,11"},0.2)`,borderRadius:"16px",padding:"20px"}}>
              <div style={{fontSize:"11px",letterSpacing:"0.12em",color:C.textLight,textTransform:"uppercase",fontWeight:"600",marginBottom:"8px"}}>Examiner verdict</div>
              <div style={{fontSize:"24px",fontWeight:"700",color:checkResult.overall==="correct"?C.accent:checkResult.overall==="error"?"#f87171":"#fbbf24",fontFamily:"Georgia,serif",marginBottom:"8px"}}>
                {checkResult.overall==="correct"?"All correct ✓":checkResult.overall==="error"?"Error found ✗":"Incomplete ⚠"}
              </div>
              <div style={{fontSize:"14px",color:C.textMid,lineHeight:1.7}}>{checkResult.summary}</div>
              {checkResult.finalAnswer&&<div style={{marginTop:"10px",fontSize:"14px"}}><span style={{color:C.textLight}}>Correct answer: </span><span style={{fontWeight:"700",color:C.accent}}>{checkResult.finalAnswer}</span></div>}
            </div>
            <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"16px",overflow:"hidden"}}>
              <div style={{padding:"13px 20px",borderBottom:"1px solid rgba(255,255,255,0.06)",fontSize:"11px",letterSpacing:"0.12em",color:C.textLight,textTransform:"uppercase",fontWeight:"600"}}>Step-by-step marking</div>
              {checkResult.steps?.map((step,i)=>(
                <div key={i} style={{padding:"13px 20px",borderBottom:"1px solid rgba(255,255,255,0.04)",background:sb(step.status)}}>
                  <div style={{display:"flex",gap:"12px",alignItems:"flex-start"}}>
                    <div style={{fontSize:"14px",fontWeight:"700",color:sc(step.status),flexShrink:0,width:"18px"}}>{step.status==="correct"?"✓":step.status==="error"?"✗":"⚠"}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:"13px",color:C.text,fontFamily:"'Courier New',monospace",marginBottom:"4px"}}>{step.line}</div>
                      {step.feedback&&<div style={{fontSize:"12px",color:step.status==="correct"?"rgba(0,200,150,0.7)":sc(step.status),lineHeight:1.6}}><MathText text={step.feedback}/></div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {(checkResult.examTip||checkResult.commonMistake)&&(
              <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"16px",overflow:"hidden"}}>
                <div style={{padding:"13px 20px",borderBottom:"1px solid rgba(255,255,255,0.06)",fontSize:"11px",letterSpacing:"0.12em",color:C.textLight,textTransform:"uppercase",fontWeight:"600"}}>Examiner advice</div>
                <div style={{padding:"16px 20px",display:"flex",flexDirection:"column",gap:"12px"}}>
                  {checkResult.examTip&&<div style={{display:"flex",gap:"10px",alignItems:"flex-start"}}>
                    <span style={{fontSize:"11px",fontWeight:"700",padding:"3px 10px",borderRadius:"999px",background:"rgba(0,200,150,0.12)",color:C.accent,border:"1px solid rgba(0,200,150,0.2)",flexShrink:0}}>HSC tip</span>
                    <div style={{fontSize:"13px",color:C.textMid,lineHeight:1.6}}>{checkResult.examTip}</div>
                  </div>}
                  {checkResult.commonMistake&&<div style={{display:"flex",gap:"10px",alignItems:"flex-start"}}>
                    <span style={{fontSize:"11px",fontWeight:"700",padding:"3px 10px",borderRadius:"999px",background:"rgba(245,158,11,0.12)",color:"#fbbf24",border:"1px solid rgba(245,158,11,0.2)",flexShrink:0}}>Watch out</span>
                    <div style={{fontSize:"13px",color:C.textMid,lineHeight:1.6}}>{checkResult.commonMistake}</div>
                  </div>}
                </div>
              </div>
            )}
            <button onClick={()=>{setCheckResult(null);setCheckWorking("");setCheckImage(null);setCheckImageB64(null);}}
              style={{padding:"11px",borderRadius:"12px",border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:C.textLight,fontFamily:"inherit",fontSize:"13px",fontWeight:"600",cursor:"pointer"}}>
              Clear and try again
            </button>
          </div>
        )}
      </>}
    </div>
  );
}

// ─── UNSW COURSES ─────────────────────────────────────────────────────────────
const UNSW_COURSES=[
  {code:"ACCT1501",name:"Accounting and Financial Management 1A",uoc:6,faculty:"Business"},
  {code:"ACCT1511",name:"Accounting and Financial Management 1B",uoc:6,faculty:"Business"},
  {code:"ACCT2101",name:"Accounting for Decision Making",uoc:6,faculty:"Business"},
  {code:"ACCT2522",name:"Management Accounting 1",uoc:6,faculty:"Business"},
  {code:"ACCT2542",name:"Corporate Financial Reporting",uoc:6,faculty:"Business"},
  {code:"ACCT3202",name:"Industry Placement",uoc:6,faculty:"Business"},
  {code:"ACCT3303",name:"Auditing and Assurance Services",uoc:6,faculty:"Business"},
  {code:"ACCT3563",name:"Issues in Financial Reporting",uoc:6,faculty:"Business"},
  {code:"ACTL1101",name:"Introduction to Actuarial Studies",uoc:6,faculty:"Business"},
  {code:"ACTL2101",name:"Industry Placement",uoc:6,faculty:"Business"},
  {code:"ACTL2111",name:"Actuarial Studies A",uoc:6,faculty:"Business"},
  {code:"ACTL3141",name:"Actuarial Theory and Practice A",uoc:6,faculty:"Business"},
  {code:"ACTL3151",name:"Life Contingencies",uoc:6,faculty:"Business"},
  {code:"ARCH1101",name:"Design Thinking",uoc:6,faculty:"Arts & Architecture"},
  {code:"ARCH1201",name:"The City: A History",uoc:6,faculty:"Arts & Architecture"},
  {code:"ARCH2101",name:"Architectural Design Studio 2",uoc:6,faculty:"Arts & Architecture"},
  {code:"ARCH3101",name:"Architectural Design Studio 3",uoc:6,faculty:"Arts & Architecture"},
  {code:"BLDG1001",name:"Introduction to Construction",uoc:6,faculty:"Arts & Architecture"},
  {code:"BLDG2100",name:"Construction Methods and Materials",uoc:6,faculty:"Arts & Architecture"},
  {code:"BLDG3001",name:"Construction Technology 3",uoc:6,faculty:"Arts & Architecture"},
  {code:"PLAN1111",name:"Planning in Australia",uoc:6,faculty:"Arts & Architecture"},
  {code:"PLAN2111",name:"Urban Planning",uoc:6,faculty:"Arts & Architecture"},
  {code:"ARTS1360",name:"The Contemporary World",uoc:6,faculty:"Arts"},
  {code:"ARTS1690",name:"Australian History",uoc:6,faculty:"Arts"},
  {code:"ARTS2090",name:"Foundations: Explanation and Enquiry",uoc:6,faculty:"Arts"},
  {code:"ARTS2630",name:"Global Ethics",uoc:6,faculty:"Arts"},
  {code:"COMM1100",name:"Being Human in a Digital World",uoc:6,faculty:"Arts"},
  {code:"COMM1180",name:"Media and Society",uoc:6,faculty:"Arts"},
  {code:"COMM2520",name:"Digital Cultures",uoc:6,faculty:"Arts"},
  {code:"ENGL1001",name:"Texts and Cultures",uoc:6,faculty:"Arts"},
  {code:"ENGL2731",name:"Narrative and Argument",uoc:6,faculty:"Arts"},
  {code:"HIST1401",name:"History in a Global Age",uoc:6,faculty:"Arts"},
  {code:"HIST2421",name:"Modern East Asia",uoc:6,faculty:"Arts"},
  {code:"JAPN1011",name:"Japanese Language 1",uoc:6,faculty:"Arts"},
  {code:"JAPN1021",name:"Japanese Language 2",uoc:6,faculty:"Arts"},
  {code:"PHIL1011",name:"Knowledge, Mind and Reality",uoc:6,faculty:"Arts"},
  {code:"PHIL2751",name:"Ethics",uoc:6,faculty:"Arts"},
  {code:"SOCI1010",name:"Imagining Social Futures",uoc:6,faculty:"Arts"},
  {code:"SOCI2011",name:"Classical Sociological Theory",uoc:6,faculty:"Arts"},
  {code:"POLS1111",name:"Government and Politics in Australia",uoc:6,faculty:"Arts"},
  {code:"POLS2741",name:"Political Theory",uoc:6,faculty:"Arts"},
  {code:"BIOL1011",name:"Biology 1A",uoc:6,faculty:"Science"},
  {code:"BIOL1021",name:"Biology 1B",uoc:6,faculty:"Science"},
  {code:"BIOL1031",name:"Higher Biology",uoc:6,faculty:"Science"},
  {code:"BIOL2011",name:"Cell Biology",uoc:6,faculty:"Science"},
  {code:"BIOL2041",name:"Genetics",uoc:6,faculty:"Science"},
  {code:"BIOL2201",name:"Ecology",uoc:6,faculty:"Science"},
  {code:"BIOL3011",name:"Evolution",uoc:6,faculty:"Science"},
  {code:"BIOL3041",name:"Molecular Biology",uoc:6,faculty:"Science"},
  {code:"BIOC2101",name:"Biochemistry and Molecular Biology A",uoc:6,faculty:"Science"},
  {code:"BIOC2201",name:"Biochemistry and Molecular Biology B",uoc:6,faculty:"Science"},
  {code:"BIOC3101",name:"Biochemistry",uoc:6,faculty:"Science"},
  {code:"BABS1201",name:"Molecules, Cells and Genes",uoc:6,faculty:"Science"},
  {code:"BABS2204",name:"Molecular Cell Biology",uoc:6,faculty:"Science"},
  {code:"BABS3031",name:"Biotechnology Research Methods",uoc:6,faculty:"Science"},
  {code:"CHEM1011",name:"Chemistry A",uoc:6,faculty:"Science"},
  {code:"CHEM1021",name:"Chemistry B",uoc:6,faculty:"Science"},
  {code:"CHEM1031",name:"Higher Chemistry A",uoc:6,faculty:"Science"},
  {code:"CHEM1041",name:"Higher Chemistry B",uoc:6,faculty:"Science"},
  {code:"CHEM2011",name:"Structure and Properties of Molecules",uoc:6,faculty:"Science"},
  {code:"CHEM2041",name:"Synthesis and Analysis of Organic Compounds",uoc:6,faculty:"Science"},
  {code:"CHEM2051",name:"Analytical Chemistry",uoc:6,faculty:"Science"},
  {code:"CHEM3011",name:"Physical Chemistry",uoc:6,faculty:"Science"},
  {code:"CHEM3101",name:"Advanced Organic Chemistry",uoc:6,faculty:"Science"},
  {code:"CVEN1300",name:"Engineering Mechanics",uoc:6,faculty:"Engineering"},
  {code:"CVEN2002",name:"Engineering Computations",uoc:6,faculty:"Engineering"},
  {code:"CVEN2101",name:"Engineering Construction and Management",uoc:6,faculty:"Engineering"},
  {code:"CVEN2201",name:"Soil Mechanics",uoc:6,faculty:"Engineering"},
  {code:"CVEN2301",name:"Mechanics of Solids",uoc:6,faculty:"Engineering"},
  {code:"CVEN2401",name:"Transport and Traffic Engineering",uoc:6,faculty:"Engineering"},
  {code:"CVEN3031",name:"Civil Engineering Design",uoc:6,faculty:"Engineering"},
  {code:"CVEN3101",name:"Engineering Operations and Control",uoc:6,faculty:"Engineering"},
  {code:"CVEN3201",name:"Foundation Engineering",uoc:6,faculty:"Engineering"},
  {code:"CVEN3301",name:"Structural Analysis",uoc:6,faculty:"Engineering"},
  {code:"CVEN4101",name:"Advanced Structural Engineering",uoc:6,faculty:"Engineering"},
  {code:"SURV1001",name:"Surveying for Engineers",uoc:6,faculty:"Engineering"},
  {code:"SURV2001",name:"Spatial Data Infrastructure",uoc:6,faculty:"Engineering"},
  {code:"SURV3001",name:"Geodesy and GPS",uoc:6,faculty:"Engineering"},
  {code:"COMP1511",name:"Programming Fundamentals",uoc:6,faculty:"Engineering"},
  {code:"COMP1521",name:"Computer Systems Fundamentals",uoc:6,faculty:"Engineering"},
  {code:"COMP1531",name:"Software Engineering Fundamentals",uoc:6,faculty:"Engineering"},
  {code:"COMP2041",name:"Software Construction",uoc:6,faculty:"Engineering"},
  {code:"COMP2511",name:"Object Oriented Design and Programming",uoc:6,faculty:"Engineering"},
  {code:"COMP2521",name:"Data Structures and Algorithms",uoc:6,faculty:"Engineering"},
  {code:"COMP3121",name:"Algorithms and Programming Techniques",uoc:6,faculty:"Engineering"},
  {code:"COMP3141",name:"Software System Design and Implementation",uoc:6,faculty:"Engineering"},
  {code:"COMP3151",name:"Foundations of Concurrency",uoc:6,faculty:"Engineering"},
  {code:"COMP3161",name:"Concepts of Programming Languages",uoc:6,faculty:"Engineering"},
  {code:"COMP3211",name:"Fundamentals of Computer Architecture",uoc:6,faculty:"Engineering"},
  {code:"COMP3231",name:"Operating Systems",uoc:6,faculty:"Engineering"},
  {code:"COMP3311",name:"Database Systems",uoc:6,faculty:"Engineering"},
  {code:"COMP3331",name:"Computer Networks and Applications",uoc:6,faculty:"Engineering"},
  {code:"COMP3411",name:"Artificial Intelligence",uoc:6,faculty:"Engineering"},
  {code:"COMP3421",name:"Computer Graphics",uoc:6,faculty:"Engineering"},
  {code:"COMP3431",name:"Robotic Software Architecture",uoc:6,faculty:"Engineering"},
  {code:"COMP3441",name:"Security Engineering",uoc:6,faculty:"Engineering"},
  {code:"COMP3821",name:"Extended Algorithms and Programming Techniques",uoc:6,faculty:"Engineering"},
  {code:"COMP4121",name:"Advanced Algorithms",uoc:6,faculty:"Engineering"},
  {code:"COMP4141",name:"Theory of Computation",uoc:6,faculty:"Engineering"},
  {code:"COMP4418",name:"Knowledge Representation and Reasoning",uoc:6,faculty:"Engineering"},
  {code:"COMP4920",name:"Professional Issues and Ethics",uoc:3,faculty:"Engineering"},
  {code:"COMP6080",name:"Web Front-End Programming",uoc:6,faculty:"Engineering"},
  {code:"COMP9417",name:"Machine Learning and Data Mining",uoc:6,faculty:"Engineering"},
  {code:"COMP9444",name:"Neural Networks and Deep Learning",uoc:6,faculty:"Engineering"},
  {code:"COMP9447",name:"Security Engineering Workshop",uoc:6,faculty:"Engineering"},
  {code:"COMP9900",name:"Information Technology Project",uoc:6,faculty:"Engineering"},
  {code:"DATA1001",name:"Foundations of Data Science",uoc:6,faculty:"Science"},
  {code:"DATA2001",name:"Data Science Technologies",uoc:6,faculty:"Science"},
  {code:"DATA2002",name:"Data Analytics: Learning from Data",uoc:6,faculty:"Science"},
  {code:"DATA3001",name:"Data Science and Decisions",uoc:6,faculty:"Science"},
  {code:"DESN1000",name:"Engineering Design",uoc:6,faculty:"Engineering"},
  {code:"DESN2000",name:"Engineering Design and Professional Practice",uoc:6,faculty:"Engineering"},
  {code:"DDES1000",name:"Design Thinking Studio",uoc:6,faculty:"Arts & Architecture"},
  {code:"DDES2010",name:"Interaction Design Studio",uoc:6,faculty:"Arts & Architecture"},
  {code:"ADES2011",name:"Design Research",uoc:6,faculty:"Arts & Architecture"},
  {code:"ECON1101",name:"Microeconomics 1",uoc:6,faculty:"Business"},
  {code:"ECON1102",name:"Macroeconomics 1",uoc:6,faculty:"Business"},
  {code:"ECON1202",name:"Quantitative Analysis for Business and Economics",uoc:6,faculty:"Business"},
  {code:"ECON2101",name:"Microeconomic Analysis and Policy",uoc:6,faculty:"Business"},
  {code:"ECON2102",name:"Macroeconomic Analysis and Policy",uoc:6,faculty:"Business"},
  {code:"ECON2206",name:"Introductory Econometrics",uoc:6,faculty:"Business"},
  {code:"ECON3101",name:"Microeconomics 3",uoc:6,faculty:"Business"},
  {code:"ECON3202",name:"International Trade",uoc:6,faculty:"Business"},
  {code:"ECON3206",name:"Econometrics",uoc:6,faculty:"Business"},
  {code:"ECON3301",name:"Environmental Economics",uoc:6,faculty:"Business"},
  {code:"ELEC1111",name:"Electrical and Telecommunications Engineering",uoc:6,faculty:"Engineering"},
  {code:"ELEC2104",name:"Electronic Devices and Circuits",uoc:6,faculty:"Engineering"},
  {code:"ELEC2133",name:"Analogue Electronics",uoc:6,faculty:"Engineering"},
  {code:"ELEC2134",name:"Circuits and Signals",uoc:6,faculty:"Engineering"},
  {code:"ELEC2141",name:"Digital Circuit Design",uoc:6,faculty:"Engineering"},
  {code:"ELEC3104",name:"Engineering Electromagnetics",uoc:6,faculty:"Engineering"},
  {code:"ELEC3106",name:"Electronics",uoc:6,faculty:"Engineering"},
  {code:"ELEC3115",name:"Electromagnetic Engineering",uoc:6,faculty:"Engineering"},
  {code:"ELEC4122",name:"Control Systems",uoc:6,faculty:"Engineering"},
  {code:"TELE3112",name:"Analogue and Digital Communications",uoc:6,faculty:"Engineering"},
  {code:"TELE3118",name:"Network Technologies",uoc:6,faculty:"Engineering"},
  {code:"TELE4642",name:"Networks",uoc:6,faculty:"Engineering"},
  {code:"ENGG1000",name:"Engineering Design and Innovation",uoc:6,faculty:"Engineering"},
  {code:"ENGG2400",name:"Mechanics of Solids",uoc:6,faculty:"Engineering"},
  {code:"ENGG2600",name:"Engineering Profession and Practice",uoc:3,faculty:"Engineering"},
  {code:"ENGG4600",name:"Engineering Vertically Integrated Project",uoc:6,faculty:"Engineering"},
  {code:"GSOE9740",name:"Industrial Ecology and Sustainable Engineering",uoc:6,faculty:"Engineering"},
  {code:"GSOE9820",name:"Technology and Policy",uoc:6,faculty:"Engineering"},
  {code:"GEOS1701",name:"Global Environmental Change",uoc:6,faculty:"Science"},
  {code:"GEOS2101",name:"Earth History and Resources",uoc:6,faculty:"Science"},
  {code:"GEOS2111",name:"Physical Geography",uoc:6,faculty:"Science"},
  {code:"GEOS3261",name:"Environmental Management",uoc:6,faculty:"Science"},
  {code:"ENVS1001",name:"Introduction to Environmental Studies",uoc:6,faculty:"Science"},
  {code:"ENVS3201",name:"Environmental Impact Assessment",uoc:6,faculty:"Science"},
  {code:"FINS1612",name:"Capital Markets and Institutions",uoc:6,faculty:"Business"},
  {code:"FINS1613",name:"Business Finance",uoc:6,faculty:"Business"},
  {code:"FINS2624",name:"Portfolio Management",uoc:6,faculty:"Business"},
  {code:"FINS2643",name:"Wealth Management",uoc:6,faculty:"Business"},
  {code:"FINS3616",name:"International Business Finance",uoc:6,faculty:"Business"},
  {code:"FINS3625",name:"Applied Corporate Finance",uoc:6,faculty:"Business"},
  {code:"FINS3630",name:"Bank Financial Management",uoc:6,faculty:"Business"},
  {code:"FINS3635",name:"Options, Futures and Risk Management",uoc:6,faculty:"Business"},
  {code:"FINS3641",name:"Security Analysis and Valuation",uoc:6,faculty:"Business"},
  {code:"FINS4781",name:"FinTech",uoc:6,faculty:"Business"},
  {code:"FOOD1001",name:"Introduction to Food Science",uoc:6,faculty:"Science"},
  {code:"FOOD2001",name:"Food Chemistry",uoc:6,faculty:"Science"},
  {code:"FOOD3001",name:"Food Processing and Preservation",uoc:6,faculty:"Science"},
  {code:"LAWS1052",name:"Foundations of Law",uoc:6,faculty:"Law"},
  {code:"LAWS1061",name:"Criminal Law and Procedure",uoc:6,faculty:"Law"},
  {code:"LAWS1071",name:"Contracts A",uoc:6,faculty:"Law"},
  {code:"LAWS1075",name:"Contracts B",uoc:6,faculty:"Law"},
  {code:"LAWS1091",name:"Introduction to Australian Public Law",uoc:6,faculty:"Law"},
  {code:"LAWS2150",name:"Administrative Law",uoc:6,faculty:"Law"},
  {code:"LAWS2151",name:"Company Law",uoc:6,faculty:"Law"},
  {code:"LAWS2159",name:"Property Law A",uoc:6,faculty:"Law"},
  {code:"LAWS2161",name:"Torts",uoc:6,faculty:"Law"},
  {code:"LAWS3014",name:"Constitutional Law A",uoc:6,faculty:"Law"},
  {code:"LAWS3015",name:"International Law",uoc:6,faculty:"Law"},
  {code:"LAWS3060",name:"Professional Responsibility and Legal Ethics",uoc:6,faculty:"Law"},
  {code:"LAWS3145",name:"Employment Law",uoc:6,faculty:"Law"},
  {code:"LAWS3161",name:"Income Taxation Law",uoc:6,faculty:"Law"},
  {code:"LEGT1710",name:"Business and the Law",uoc:6,faculty:"Law"},
  {code:"LEGT2751",name:"Commercial Law",uoc:6,faculty:"Law"},
  {code:"LEGT3710",name:"Employment Law",uoc:6,faculty:"Law"},
  {code:"MGMT1001",name:"Managing Organisations and People",uoc:6,faculty:"Business"},
  {code:"MGMT1101",name:"Global Business Environment",uoc:6,faculty:"Business"},
  {code:"MGMT1301",name:"Organisations and Management",uoc:6,faculty:"Business"},
  {code:"MGMT2102",name:"Organisational Behaviour",uoc:6,faculty:"Business"},
  {code:"MGMT2718",name:"Sustainable Business Management",uoc:6,faculty:"Business"},
  {code:"MGMT3102",name:"Managing Organisational Dynamics",uoc:6,faculty:"Business"},
  {code:"MGMT3721",name:"Human Resource Management",uoc:6,faculty:"Business"},
  {code:"MGMT3723",name:"Entrepreneurship",uoc:6,faculty:"Business"},
  {code:"MARK1012",name:"Marketing Fundamentals",uoc:6,faculty:"Business"},
  {code:"MARK2051",name:"Consumer Behaviour",uoc:6,faculty:"Business"},
  {code:"MARK2054",name:"Marketing Communications",uoc:6,faculty:"Business"},
  {code:"MARK3054",name:"Brand Management",uoc:6,faculty:"Business"},
  {code:"MARK3082",name:"Digital Marketing",uoc:6,faculty:"Business"},
  {code:"MATS1101",name:"Materials Science and Engineering",uoc:6,faculty:"Engineering"},
  {code:"MATS2002",name:"Structure and Properties of Materials",uoc:6,faculty:"Engineering"},
  {code:"MATS2003",name:"Materials Testing and Manufacturing",uoc:6,faculty:"Engineering"},
  {code:"MATS3003",name:"Advanced Materials",uoc:6,faculty:"Engineering"},
  {code:"MANF2700",name:"Industrial Engineering",uoc:6,faculty:"Engineering"},
  {code:"MANF3020",name:"Manufacturing Systems",uoc:6,faculty:"Engineering"},
  {code:"MATH1031",name:"Mathematics for Life Sciences",uoc:6,faculty:"Science"},
  {code:"MATH1041",name:"Statistics for Life and Social Sciences",uoc:6,faculty:"Science"},
  {code:"MATH1081",name:"Discrete Mathematics",uoc:6,faculty:"Science"},
  {code:"MATH1131",name:"Mathematics 1A",uoc:6,faculty:"Science"},
  {code:"MATH1141",name:"Higher Mathematics 1A",uoc:6,faculty:"Science"},
  {code:"MATH1231",name:"Mathematics 1B",uoc:6,faculty:"Science"},
  {code:"MATH1241",name:"Higher Mathematics 1B",uoc:6,faculty:"Science"},
  {code:"MATH2018",name:"Engineering Mathematics 2D",uoc:6,faculty:"Science"},
  {code:"MATH2019",name:"Engineering Mathematics 2E",uoc:6,faculty:"Science"},
  {code:"MATH2069",name:"Mathematics 2A",uoc:6,faculty:"Science"},
  {code:"MATH2099",name:"Mathematics 2B",uoc:6,faculty:"Science"},
  {code:"MATH2111",name:"Higher Several Variable Calculus",uoc:6,faculty:"Science"},
  {code:"MATH2121",name:"Theory and Applications of Differential Equations",uoc:6,faculty:"Science"},
  {code:"MATH2221",name:"Higher Theory and Applications of Differential Equations",uoc:6,faculty:"Science"},
  {code:"MATH2301",name:"Mathematical Computing",uoc:6,faculty:"Science"},
  {code:"MATH2400",name:"Finite Mathematics",uoc:6,faculty:"Science"},
  {code:"MATH2501",name:"Linear Algebra",uoc:6,faculty:"Science"},
  {code:"MATH2601",name:"Higher Linear Algebra",uoc:6,faculty:"Science"},
  {code:"MATH2701",name:"Abstract Algebra and Fundamental Analysis",uoc:6,faculty:"Science"},
  {code:"MATH2801",name:"Theory of Statistics",uoc:6,faculty:"Science"},
  {code:"MATH2841",name:"Statistics for Engineers and Scientists",uoc:6,faculty:"Science"},
  {code:"MATH2931",name:"Higher Statistical Inference",uoc:6,faculty:"Science"},
  {code:"MATH3001",name:"Pure Mathematics 3",uoc:6,faculty:"Science"},
  {code:"MATH3101",name:"Differential Geometry",uoc:6,faculty:"Science"},
  {code:"MATH3201",name:"Real and Complex Analysis",uoc:6,faculty:"Science"},
  {code:"MATH3261",name:"Fluids, Oceans and Climates",uoc:6,faculty:"Science"},
  {code:"MATH3301",name:"Algorithms and Complexity",uoc:6,faculty:"Science"},
  {code:"MATH3411",name:"Information, Codes and Ciphers",uoc:6,faculty:"Science"},
  {code:"MATH3701",name:"Higher Topology and Differential Geometry",uoc:6,faculty:"Science"},
  {code:"MATH3801",name:"Probability and Stochastic Processes",uoc:6,faculty:"Science"},
  {code:"MATH3821",name:"Statistical Modelling and Computing",uoc:6,faculty:"Science"},
  {code:"MATH3831",name:"Statistical Inference",uoc:6,faculty:"Science"},
  {code:"MATH3841",name:"Statistical Machine Learning",uoc:6,faculty:"Science"},
  {code:"MECH1000",name:"Introduction to Mechanical Engineering",uoc:6,faculty:"Engineering"},
  {code:"MECH2400",name:"Mechanical Design 1",uoc:6,faculty:"Engineering"},
  {code:"MECH2500",name:"Dynamics",uoc:6,faculty:"Engineering"},
  {code:"MECH3110",name:"Thermodynamics and Fluid Mechanics",uoc:6,faculty:"Engineering"},
  {code:"MECH3121",name:"Mechanical Systems Design",uoc:6,faculty:"Engineering"},
  {code:"MECH4620",name:"Computational Fluid Dynamics",uoc:6,faculty:"Engineering"},
  {code:"AMME1362",name:"Introduction to Engineering Materials",uoc:6,faculty:"Engineering"},
  {code:"AMME2000",name:"Engineering Analysis",uoc:6,faculty:"Engineering"},
  {code:"AMME2200",name:"Thermofluids",uoc:6,faculty:"Engineering"},
  {code:"AMME2301",name:"Mechanics of Solids",uoc:6,faculty:"Engineering"},
  {code:"AMME3500",name:"System Dynamics and Control",uoc:6,faculty:"Engineering"},
  {code:"AMME4710",name:"Robotics and Automation",uoc:6,faculty:"Engineering"},
  {code:"AVEN4112",name:"Aerodynamics",uoc:6,faculty:"Engineering"},
  {code:"MTRN3500",name:"Mobile Robotics",uoc:6,faculty:"Engineering"},
  {code:"MTRN4110",name:"Advanced Robotics",uoc:6,faculty:"Engineering"},
  {code:"ANAT1511",name:"Anatomy",uoc:6,faculty:"Medicine"},
  {code:"ANAT2521",name:"Applied Anatomy",uoc:6,faculty:"Medicine"},
  {code:"BMED1001",name:"Foundations of Medicine",uoc:6,faculty:"Medicine"},
  {code:"BMED2401",name:"Disease and Defence",uoc:6,faculty:"Medicine"},
  {code:"BMED2405",name:"Molecules, Cells and Genes in Medicine",uoc:6,faculty:"Medicine"},
  {code:"BMED2410",name:"Digestion, Absorption and Metabolism",uoc:6,faculty:"Medicine"},
  {code:"CLIM0001",name:"Climate and Health",uoc:6,faculty:"Medicine"},
  {code:"PATH2201",name:"Pathology",uoc:6,faculty:"Medicine"},
  {code:"PATH3205",name:"Systemic Pathology",uoc:6,faculty:"Medicine"},
  {code:"PHCM9001",name:"Epidemiology",uoc:6,faculty:"Medicine"},
  {code:"PHCM9011",name:"Population Health",uoc:6,faculty:"Medicine"},
  {code:"PHPH3101",name:"Physiology",uoc:6,faculty:"Medicine"},
  {code:"SOMA4001",name:"Human Anatomy",uoc:6,faculty:"Medicine"},
  {code:"SPHL3001",name:"Introduction to Speech Pathology",uoc:6,faculty:"Medicine"},
  {code:"MINE1010",name:"Introduction to Mining Engineering",uoc:6,faculty:"Engineering"},
  {code:"MINE2120",name:"Mine Design and Planning",uoc:6,faculty:"Engineering"},
  {code:"PTRL2010",name:"Introduction to Petroleum Engineering",uoc:6,faculty:"Engineering"},
  {code:"PTRL3010",name:"Reservoir Engineering",uoc:6,faculty:"Engineering"},
  {code:"PTRL4013",name:"Petroleum Production Engineering",uoc:6,faculty:"Engineering"},
  {code:"PHAR1111",name:"Pharmacy Practice 1",uoc:6,faculty:"Pharmacy"},
  {code:"PHAR1121",name:"Pharmaceutical Chemistry 1A",uoc:6,faculty:"Pharmacy"},
  {code:"PHAR1131",name:"Pharmacology and Pathophysiology 1",uoc:6,faculty:"Pharmacy"},
  {code:"PHAR1141",name:"Pharmaceutics 1",uoc:6,faculty:"Pharmacy"},
  {code:"PHAR2111",name:"Pharmacy Practice 2",uoc:6,faculty:"Pharmacy"},
  {code:"PHAR2121",name:"Pharmaceutical Chemistry 2",uoc:6,faculty:"Pharmacy"},
  {code:"PHAR2131",name:"Pharmacology and Pathophysiology 2",uoc:6,faculty:"Pharmacy"},
  {code:"PHAR2141",name:"Pharmaceutics 2",uoc:6,faculty:"Pharmacy"},
  {code:"PHAR2151",name:"Pharmacognosy",uoc:6,faculty:"Pharmacy"},
  {code:"PHAR3111",name:"Pharmacy Practice 3",uoc:6,faculty:"Pharmacy"},
  {code:"PHAR3121",name:"Pharmaceutical Chemistry 3",uoc:6,faculty:"Pharmacy"},
  {code:"PHAR3131",name:"Pharmacology 3",uoc:6,faculty:"Pharmacy"},
  {code:"PHAR3141",name:"Pharmaceutics 3",uoc:6,faculty:"Pharmacy"},
  {code:"PHAR4111",name:"Pharmacy Practice 4A",uoc:6,faculty:"Pharmacy"},
  {code:"PHAR4112",name:"Pharmacy Practice 4B",uoc:6,faculty:"Pharmacy"},
  {code:"PHAR4121",name:"Drug Design and Action",uoc:6,faculty:"Pharmacy"},
  {code:"PHAR4141",name:"Pharmaceutical Sciences",uoc:6,faculty:"Pharmacy"},
  {code:"PHYS1121",name:"Physics 1A",uoc:6,faculty:"Science"},
  {code:"PHYS1131",name:"Higher Physics 1A",uoc:6,faculty:"Science"},
  {code:"PHYS1221",name:"Physics 1B",uoc:6,faculty:"Science"},
  {code:"PHYS1231",name:"Higher Physics 1B",uoc:6,faculty:"Science"},
  {code:"PHYS2111",name:"Mechanics, Thermodynamics and Waves",uoc:6,faculty:"Science"},
  {code:"PHYS2113",name:"Quantum Mechanics",uoc:6,faculty:"Science"},
  {code:"PHYS2114",name:"Astrophysics",uoc:6,faculty:"Science"},
  {code:"PHYS2121",name:"Electromagnetism and Quantum Mechanics",uoc:6,faculty:"Science"},
  {code:"PHYS3011",name:"Atoms, Nuclei and Fields",uoc:6,faculty:"Science"},
  {code:"PHYS3111",name:"Quantum Mechanics and Electrodynamics",uoc:6,faculty:"Science"},
  {code:"PHYS3113",name:"Advanced Condensed Matter Physics",uoc:6,faculty:"Science"},
  {code:"PHYS3115",name:"Astrophysics and Relativity",uoc:6,faculty:"Science"},
  {code:"PSYC1001",name:"Psychology 1A",uoc:6,faculty:"Science"},
  {code:"PSYC1011",name:"Psychology 1B",uoc:6,faculty:"Science"},
  {code:"PSYC2001",name:"Research Methods 2",uoc:6,faculty:"Science"},
  {code:"PSYC2101",name:"Cognitive Psychology",uoc:6,faculty:"Science"},
  {code:"PSYC2111",name:"Social and Developmental Psychology",uoc:6,faculty:"Science"},
  {code:"PSYC2121",name:"Biological Bases of Behaviour",uoc:6,faculty:"Science"},
  {code:"PSYC3001",name:"Research Methods 3",uoc:6,faculty:"Science"},
  {code:"PSYC3101",name:"Perception",uoc:6,faculty:"Science"},
  {code:"PSYC3211",name:"Abnormal Psychology",uoc:6,faculty:"Science"},
  {code:"SWKH1001",name:"Introduction to Social Work",uoc:6,faculty:"Arts"},
  {code:"SWKH2001",name:"Social Work Practice",uoc:6,faculty:"Arts"},
  {code:"SWKH3001",name:"Advanced Social Work Practice",uoc:6,faculty:"Arts"},
  {code:"STAT1101",name:"Statistics for Life Sciences",uoc:6,faculty:"Science"},
  {code:"STAT2001",name:"Probability",uoc:6,faculty:"Science"},
  {code:"STAT2101",name:"Applied Statistics",uoc:6,faculty:"Science"},
  {code:"STAT3001",name:"Statistical Inference",uoc:6,faculty:"Science"},
  {code:"GEND1000",name:"Challenging Gender",uoc:6,faculty:"GenEd"},
  {code:"GENS4010",name:"Science, Technology and Society",uoc:6,faculty:"GenEd"},
  {code:"GENL5004",name:"Leadership Transforming Lives",uoc:6,faculty:"GenEd"},
  {code:"GMAT2001",name:"Global Mathematics",uoc:6,faculty:"GenEd"},
].sort((a,b)=>a.code.localeCompare(b.code));

const COURSE_COLORS=["#6366f1","#f59e0b","#ef4444","#3b82f6","#10b981","#ec4899","#8b5cf6","#f97316","#06b6d4","#84cc16","#14b8a6","#a855f7"];

// ─── TIMETABLE TAB ────────────────────────────────────────────────────────────
function TimetableTab(){
  const[search,setSearch]=useState("");
  const[selected,setSelected]=useState([]);
  const[showDrop,setShowDrop]=useState(false);
  const[slots,setSlots]=useState({});
  const[addingSlot,setAddingSlot]=useState(null);
  const[slotType,setSlotType]=useState("Lecture");
  const[apiResults,setApiResults]=useState([]);
  const[fetching,setFetching]=useState(false);
  const debounceRef=useRef(null);
  const days=["Mon","Tue","Wed","Thu","Fri"];
  const hours=Array.from({length:13},(_,i)=>i+8);

  useEffect(()=>{
    if(search.length<2){setApiResults([]);return;}
    clearTimeout(debounceRef.current);
    debounceRef.current=setTimeout(async()=>{
      setFetching(true);
      try{
        const url=`https://handbook-proxy.cse.unsw.edu.au/current/api/search-all?searchType=advanced&siteId=unsw-prod-pres&query=${encodeURIComponent(search)}&siteYear=2026`;
        const resp=await fetch(url);
        const data=await resp.json();
        const courses=(data.contentlets||[])
          .filter(c=>c.contentTypeLabel==="Course"&&c.code)
          .slice(0,10)
          .map(c=>({code:c.code,name:c.title||c.name||"",uoc:c.creditPoints||6,faculty:c.facultyID||""}));
        setApiResults(courses);
      }catch{
        const q=search.toLowerCase();
        const local=UNSW_COURSES.filter(c=>c.code.toLowerCase().includes(q)||c.name.toLowerCase().includes(q)).slice(0,10);
        setApiResults(local);
      }
      setFetching(false);
    },350);
  },[search]);

  const filtered=search.length>=2?(apiResults.length>0?apiResults:UNSW_COURSES.filter(c=>{
    const q=search.toLowerCase();
    return c.code.toLowerCase().includes(q)||c.name.toLowerCase().includes(q);
  }).slice(0,10)):[];

  const addCourse=c=>{
    if(selected.find(s=>s.code===c.code))return;
    const color=COURSE_COLORS[selected.length%COURSE_COLORS.length];
    setSelected(p=>[...p,{...c,color}]);
    setSearch("");setShowDrop(false);setApiResults([]);
  };
  const removeCourse=code=>{
    setSelected(p=>p.filter(c=>c.code!==code));
    const newSlots={};
    Object.entries(slots).forEach(([k,v])=>{if(v.courseCode!==code)newSlots[k]=v;});
    setSlots(newSlots);
  };
  const handleCellClick=(day,hour)=>{
    const key=`${day}-${hour}`;
    if(slots[key]){setSlots(p=>{const n={...p};delete n[key];return n;});return;}
    if(selected.length===0)return;
    setAddingSlot({day,hour});
  };
  const confirmSlot=(courseCode,type)=>{
    if(!addingSlot)return;
    const key=`${addingSlot.day}-${addingSlot.hour}`;
    const course=selected.find(c=>c.code===courseCode);
    setSlots(p=>({...p,[key]:{courseCode,type,color:course?.color}}));
    setAddingSlot(null);
  };
  const handbookUrl=code=>`https://www.handbook.unsw.edu.au/undergraduate/courses/2026/${code}`;

  return(
    <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
      <div style={{...card,overflow:"visible"}}>
        <div style={cardH}>Select your courses</div>
        <div style={{padding:"14px 18px",position:"relative",borderRadius:"0 0 12px 12px",overflow:"visible"}}>
          <input style={inp} placeholder="Search any UNSW course by code or name..." value={search}
            onChange={e=>{setSearch(e.target.value);setShowDrop(true);}}
            onFocus={()=>setShowDrop(true)} onBlur={()=>setTimeout(()=>setShowDrop(false),160)}/>
          {fetching&&<div style={{position:"absolute",right:"28px",top:"50%",transform:"translateY(-50%)",fontSize:"11px",color:C.textLight}}>searching...</div>}
          {showDrop&&filtered.length>0&&(
            <div style={{position:"absolute",top:"calc(100% - 2px)",left:"18px",right:"18px",zIndex:200,background:C.bg,border:`1px solid ${C.border}`,borderRadius:"10px",overflow:"hidden",maxHeight:"320px",overflowY:"auto",boxShadow:"0 8px 24px rgba(0,0,0,0.12)"}}>
              {filtered.map(c=>(
                <div key={c.code} onMouseDown={()=>addCourse(c)}
                  style={{padding:"11px 16px",cursor:"pointer",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}
                  onMouseEnter={e=>e.currentTarget.style.background=C.surface}
                  onMouseLeave={e=>e.currentTarget.style.background=C.bg}>
                  <div>
                    <div style={{fontSize:"13px",fontWeight:"600",color:C.text}}>{c.code}</div>
                    <div style={{fontSize:"12px",color:C.textMid}}>{c.name} · {c.uoc} UOC</div>
                  </div>
                  <span style={{fontSize:"11px",color:C.textLight,background:C.surface,padding:"3px 8px",borderRadius:"6px"}}>{c.faculty}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {selected.length>0&&(
          <div style={{borderTop:`1px solid ${C.border}`}}>
            {selected.map(c=>(
              <div key={c.code} style={{display:"flex",alignItems:"center",gap:"12px",padding:"12px 18px",borderBottom:`1px solid ${C.border}`}}>
                <div style={{width:"14px",height:"14px",borderRadius:"50%",background:c.color,flexShrink:0}}/>
                <div style={{flex:1}}>
                  <a href={handbookUrl(c.code)} target="_blank" rel="noreferrer"
                    style={{fontSize:"14px",fontWeight:"600",color:C.text,textDecoration:"none",display:"flex",alignItems:"center",gap:"6px"}}>
                    {c.code} <span style={{fontSize:"11px",color:C.accent}}>↗</span>
                  </a>
                  <div style={{fontSize:"12px",color:C.textMid}}>{c.name} · {c.uoc} UOC</div>
                </div>
                <button onClick={()=>removeCourse(c.code)} style={{background:"none",border:"none",color:C.textLight,cursor:"pointer",fontSize:"18px",padding:"2px 6px"}}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{...card,overflow:"auto"}}>
        <div style={cardH}>Weekly timetable. Click a cell to add a class</div>
        <div style={{padding:"12px",overflowX:"auto"}}>
          <div style={{display:"grid",gridTemplateColumns:`60px repeat(5,1fr)`,gap:"2px",minWidth:"500px"}}>
            <div/>
            {days.map(d=>(
              <div key={d} style={{textAlign:"center",fontSize:"12px",fontWeight:"700",color:C.textMid,padding:"6px 0",letterSpacing:"0.08em"}}>{d}</div>
            ))}
            {hours.map(h=>(
              <React.Fragment key={h}>
                <div style={{fontSize:"11px",color:C.textLight,padding:"4px 8px 4px 0",textAlign:"right",lineHeight:"32px"}}>
                  {h<12?`${h}am`:h===12?`12pm`:`${h-12}pm`}
                </div>
                {days.map(d=>{
                  const key=`${d}-${h}`;
                  const slot=slots[key];
                  return(
                    <div key={key} onClick={()=>handleCellClick(d,h)}
                      style={{height:"32px",borderRadius:"6px",cursor:selected.length>0||slot?"pointer":"default",
                        background:slot?slot.color:"rgba(0,0,0,0.03)",
                        border:`1px solid ${slot?slot.color+"60":C.border}`,
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:"10px",fontWeight:"600",color:slot?"#fff":C.textLight,
                        transition:"all 0.1s",overflow:"hidden",padding:"0 4px"}}>
                      {slot&&<span style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{slot.courseCode} {slot.type}</span>}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      {addingSlot&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center"}}
          onClick={e=>{if(e.target===e.currentTarget)setAddingSlot(null);}}>
          <div style={{...card,padding:"24px",width:"320px",maxWidth:"90vw"}}>
            <div style={{fontSize:"16px",fontWeight:"700",color:C.text,marginBottom:"16px"}}>
              Add class. {addingSlot.day} {addingSlot.hour<12?`${addingSlot.hour}am`:addingSlot.hour===12?"12pm":`${addingSlot.hour-12}pm`}
            </div>
            <div style={{marginBottom:"12px"}}>
              <label style={lbl}>Course</label>
              <select style={sel} id="slot-course">{selected.map(c=><option key={c.code} value={c.code}>{c.code} {c.name}</option>)}</select>
            </div>
            <div style={{marginBottom:"16px"}}>
              <label style={lbl}>Class type</label>
              <select style={sel} value={slotType} onChange={e=>setSlotType(e.target.value)}>
                {["Lecture","Tutorial","Lab","Seminar","Other"].map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{display:"flex",gap:"10px"}}>
              <button style={{...btn,flex:1}} onClick={()=>confirmSlot(document.getElementById("slot-course").value,slotType)}>Add</button>
              <button style={{...btn,flex:1,background:"transparent",border:`1px solid ${C.border}`,color:C.textMid}} onClick={()=>setAddingSlot(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <div style={{fontSize:"11px",color:C.textLight,textAlign:"center"}}>
        Searches all UNSW courses live. Click a course code ↗ to open the handbook. Click a cell to add a class, click again to remove.
      </div>
    </div>
  );
}

// ─── PROGRESS TAB ─────────────────────────────────────────────────────────────
function ProgressTab({user}){
  const C=THEMES.dark;
  const[attempts,setAttempts]=useState([]);
  const[loading,setLoading]=useState(true);
  const[selected,setSelected]=useState(null);

  useEffect(()=>{
    if(!user||!fbDb)return;
    fbDb.collection("users").doc(user.uid).collection("attempts")
      .orderBy("timestamp","desc").limit(50)
      .get().then(snap=>{
        setAttempts(snap.docs.map(d=>({id:d.id,...d.data()})));
        setLoading(false);
      }).catch(()=>setLoading(false));
  },[user]);

  const pcard={background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"16px",overflow:"hidden"};
  const overallColor=o=>o==="correct"?C.accent:o==="partial"?"#F59E0B":"#EF4444";
  const overallBg=o=>o==="correct"?"rgba(0,200,150,0.10)":o==="partial"?"rgba(245,158,11,0.10)":"rgba(239,68,68,0.10)";

  if(!user)return<div style={{textAlign:"center",padding:"60px 0",color:C.textMid,fontSize:"15px"}}>Sign in to track your progress.</div>;
  if(loading)return<div style={{textAlign:"center",padding:"60px 0",color:C.textMid,fontSize:"15px"}}>Loading...</div>;
  if(attempts.length===0)return<div style={{textAlign:"center",padding:"60px 0",color:C.textMid,fontSize:"15px"}}>No attempts yet. Start practising!</div>;

  const totalAttempted=attempts.length;
  const totalCorrect=attempts.filter(a=>a.overall==="correct").length;
  const totalMarks=attempts.reduce((s,a)=>s+a.marks_awarded,0);
  const totalPossible=attempts.reduce((s,a)=>s+a.marks_total,0);

  return(
    <div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
      <div style={{display:"flex",gap:"12px",flexWrap:"wrap"}}>
        {[
          {n:totalAttempted,l:"Attempted"},
          {n:totalCorrect,l:"Correct"},
          {n:`${totalMarks}/${totalPossible}`,l:"Marks"},
          {n:totalAttempted>0?Math.round(totalCorrect/totalAttempted*100)+"%":"—",l:"Accuracy"},
        ].map(({n,l})=>(
          <div key={l} style={{flex:1,minWidth:"100px",...pcard,padding:"16px",textAlign:"center"}}>
            <div style={{fontSize:"26px",fontWeight:"700",color:"#fff",fontFamily:"Georgia,serif"}}>{n}</div>
            <div style={{fontSize:"11px",color:C.textLight,marginTop:"4px",letterSpacing:"0.1em",textTransform:"uppercase"}}>{l}</div>
          </div>
        ))}
      </div>
      <div style={pcard}>
        <div style={{padding:"14px 20px",borderBottom:"1px solid rgba(255,255,255,0.06)",fontSize:"11px",fontWeight:"600",color:C.textLight,letterSpacing:"0.1em",textTransform:"uppercase"}}>Recent Attempts</div>
        <div style={{display:"flex",flexDirection:"column"}}>
          {attempts.map((a,i)=>(
            <div key={a.id}>
              <div style={{padding:"14px 20px",display:"flex",alignItems:"center",gap:"12px",cursor:"pointer",transition:"background 0.15s",borderBottom:i<attempts.length-1?"1px solid rgba(255,255,255,0.04)":"none"}}
                onClick={()=>setSelected(selected?.id===a.id?null:a)}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.03)"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:"13px",fontWeight:"600",color:C.text,marginBottom:"3px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{a.course} · {a.topic}</div>
                  <div style={{fontSize:"11px",color:C.textLight}}>{a.difficulty} · {a.timestamp?.toDate?.()?.toLocaleDateString("en-AU",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:"8px",flexShrink:0}}>
                  <span style={{fontSize:"13px",fontWeight:"700",color:overallColor(a.overall)}}>{a.marks_awarded}/{a.marks_total}</span>
                  <span style={{fontSize:"11px",fontWeight:"600",padding:"3px 10px",borderRadius:"999px",background:overallBg(a.overall),color:overallColor(a.overall),border:`1px solid ${overallColor(a.overall)}33`,textTransform:"capitalize"}}>{a.overall}</span>
                  <span style={{fontSize:"12px",color:C.textLight,display:"inline-block",transform:selected?.id===a.id?"rotate(90deg)":"rotate(0deg)"}}>›</span>
                </div>
              </div>
              {selected?.id===a.id&&(
                <div style={{padding:"16px 20px 20px",background:"rgba(0,0,0,0.2)",borderBottom:i<attempts.length-1?"1px solid rgba(255,255,255,0.04)":"none",display:"flex",flexDirection:"column",gap:"12px"}}>
                  <div style={{fontSize:"14px",color:C.text,lineHeight:1.8,fontFamily:"Georgia,serif",padding:"14px 16px",background:"rgba(255,255,255,0.03)",borderRadius:"10px",border:"1px solid rgba(255,255,255,0.06)"}}>
                    <MathText text={a.question}/>
                  </div>
                  <div>
                    <div style={{fontSize:"11px",color:C.textLight,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"6px"}}>Your answer</div>
                    <div style={{fontSize:"13px",color:"rgba(255,255,255,0.7)",fontFamily:"'Courier New',monospace",lineHeight:1.7,padding:"12px 14px",background:"rgba(255,255,255,0.03)",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.06)",whiteSpace:"pre-wrap"}}>{a.answer}</div>
                  </div>
                  {a.questionObj?.solution_steps&&(
                    <div>
                      <div style={{fontSize:"11px",color:C.textLight,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"6px"}}>Solution</div>
                      <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                        {a.questionObj.solution_steps.map((s,i)=>(
                          <div key={i} style={{fontSize:"13px",color:"rgba(255,255,255,0.75)",lineHeight:1.7,padding:"8px 12px",background:"rgba(0,200,150,0.05)",borderRadius:"8px",border:"1px solid rgba(0,200,150,0.1)"}}>
                            <MathText text={s}/>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD TAB ────────────────────────────────────────────────────────────
function DashboardTab({user}){
  const C=THEMES.dark;
  const[attempts,setAttempts]=useState([]);
  const[loading,setLoading]=useState(true);

  useEffect(()=>{
    if(!user||!fbDb){setLoading(false);return;}
    fbDb.collection("users").doc(user.uid).collection("attempts")
      .orderBy("timestamp","desc").limit(200)
      .get().then(snap=>{
        setAttempts(snap.docs.map(d=>({id:d.id,...d.data()})));
        setLoading(false);
      }).catch(()=>setLoading(false));
  },[user]);

  if(!user)return<div style={{textAlign:"center",padding:"80px 0",color:C.textMid,fontSize:"15px"}}>Sign in to see your dashboard.</div>;
  if(loading)return<div style={{textAlign:"center",padding:"80px 0",color:C.textMid}}>Loading...</div>;

  const activityMap={};
  attempts.forEach(a=>{
    if(!a.timestamp?.toDate)return;
    const d=a.timestamp.toDate();
    const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    activityMap[key]=(activityMap[key]||0)+1;
  });

  const today=new Date();
  const weeks=[];
  const start=new Date(today);
  start.setDate(start.getDate()-15*7-start.getDay());
  for(let w=0;w<16;w++){
    const week=[];
    for(let d=0;d<7;d++){
      const date=new Date(start);
      date.setDate(start.getDate()+w*7+d);
      const key=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
      week.push({date,key,count:activityMap[key]||0});
    }
    weeks.push(week);
  }

  const maxCount=Math.max(1,...Object.values(activityMap));
  const getColor=count=>{
    if(count===0)return"rgba(255,255,255,0.05)";
    const i=Math.min(1,count/Math.max(3,maxCount*0.5));
    if(i<0.33)return"rgba(0,200,150,0.3)";
    if(i<0.66)return"rgba(0,200,150,0.6)";
    return"rgba(0,200,150,0.95)";
  };

  const totalAttempted=attempts.length;
  const totalCorrect=attempts.filter(a=>a.overall==="correct").length;
  const totalMarks=attempts.reduce((s,a)=>s+(a.marks_awarded||0),0);
  const totalPossible=attempts.reduce((s,a)=>s+(a.marks_total||0),0);
  const accuracy=totalAttempted>0?Math.round(totalCorrect/totalAttempted*100):0;

  const monthLabels=[];
  weeks.forEach((week,wi)=>{
    const first=week.find(d=>d.date.getDate()<=7);
    if(first&&wi>0)monthLabels.push({wi,label:first.date.toLocaleString('default',{month:'short'})});
  });

  const dc={background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"16px",overflow:"hidden"};

  return(
    <div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
      <div>
        <h2 style={{fontSize:"28px",fontWeight:"700",color:"#fff",fontFamily:"Georgia,serif",letterSpacing:"-0.02em",marginBottom:"4px"}}>
          {user.displayName?`Welcome back, ${user.displayName.split(" ")[0]}.`:"Dashboard"}
        </h2>
        <p style={{fontSize:"14px",color:C.textMid}}>Your study activity at a glance</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"12px"}}>
        {[
          {n:totalAttempted,l:"Questions",sub:"attempted"},
          {n:totalCorrect,l:"Correct",sub:"answers"},
          {n:totalPossible>0?`${totalMarks}/${totalPossible}`:"—",l:"Marks",sub:"earned"},
          {n:accuracy+"%",l:"Accuracy",sub:"overall"},
        ].map(({n,l,sub})=>(
          <div key={l} style={{...dc,padding:"20px"}}>
            <div style={{fontSize:"11px",color:C.textLight,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"8px",fontWeight:"600"}}>{l}</div>
            <div style={{fontSize:"30px",fontWeight:"700",color:"#fff",fontFamily:"Georgia,serif",lineHeight:1}}>{n}</div>
            <div style={{fontSize:"11px",color:C.textLight,marginTop:"6px"}}>{sub}</div>
          </div>
        ))}
      </div>
      <div style={dc}>
        <div style={{padding:"16px 20px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:"13px",fontWeight:"600",color:C.text}}>Activity</div>
          <div style={{fontSize:"11px",color:C.textLight}}>{totalAttempted} questions · last 4 months</div>
        </div>
        <div style={{padding:"16px 20px",overflowX:"auto"}}>
          <div style={{display:"grid",gridTemplateColumns:`18px repeat(16,1fr)`,gap:"3px",marginBottom:"4px"}}>
            <div/>
            {weeks.map((week,wi)=>{
              const label=monthLabels.find(m=>m.wi===wi);
              return<div key={wi} style={{fontSize:"9px",color:C.textLight}}>{label?.label||""}</div>;
            })}
          </div>
          {[0,1,2,3,4,5,6].map(dayIdx=>(
            <div key={dayIdx} style={{display:"grid",gridTemplateColumns:`18px repeat(16,1fr)`,gap:"3px",marginBottom:"3px"}}>
              <div style={{fontSize:"9px",color:C.textLight,lineHeight:"12px",textAlign:"right",paddingRight:"4px"}}>
                {[1,3,5].includes(dayIdx)?["S","M","T","W","T","F","S"][dayIdx]:""}
              </div>
              {weeks.map((week,wi)=>{
                const cell=week[dayIdx];
                const isFuture=cell.date>today;
                return(
                  <div key={wi}
                    title={cell.count>0?`${cell.key}: ${cell.count} question${cell.count>1?"s":""}`:cell.key}
                    style={{width:"100%",aspectRatio:"1",borderRadius:"2px",background:isFuture?"transparent":getColor(cell.count),cursor:cell.count>0?"pointer":"default"}}/>
                );
              })}
            </div>
          ))}
          <div style={{display:"flex",alignItems:"center",gap:"6px",marginTop:"12px",justifyContent:"flex-end"}}>
            <span style={{fontSize:"10px",color:C.textLight}}>Less</span>
            {["rgba(255,255,255,0.05)","rgba(0,200,150,0.3)","rgba(0,200,150,0.6)","rgba(0,200,150,0.95)"].map((col,i)=>(
              <div key={i} style={{width:"10px",height:"10px",borderRadius:"2px",background:col}}/>
            ))}
            <span style={{fontSize:"10px",color:C.textLight}}>More</span>
          </div>
        </div>
      </div>
      {attempts.length>0&&(
        <div style={dc}>
          <div style={{padding:"14px 20px",borderBottom:"1px solid rgba(255,255,255,0.06)",fontSize:"11px",fontWeight:"600",color:C.textLight,letterSpacing:"0.1em",textTransform:"uppercase"}}>Recent Activity</div>
          {attempts.slice(0,8).map((a,i)=>{
            const col=a.overall==="correct"?"#00C896":a.overall==="partial"?"#F59E0B":"#EF4444";
            const ts=a.timestamp?.toDate?.();
            return(
              <div key={a.id} style={{display:"flex",alignItems:"center",gap:"12px",padding:"12px 20px",borderBottom:i<Math.min(7,attempts.length-1)?"1px solid rgba(255,255,255,0.04)":"none"}}>
                <div style={{width:"6px",height:"6px",borderRadius:"50%",background:col,flexShrink:0}}/>
                <div style={{flex:1,fontSize:"13px",color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.course} · {a.topic}</div>
                <div style={{fontSize:"12px",fontWeight:"600",color:col}}>{a.marks_awarded}/{a.marks_total}</div>
                <div style={{fontSize:"11px",color:C.textLight,flexShrink:0}}>{ts?ts.toLocaleDateString("en-AU",{day:"numeric",month:"short"}):""}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
function HomeFeatures(){
  const C=THEMES.dark;
  const features=[
    {fig:"FIG 0.1",title:"AI-powered questions",desc:"Generate unique exam-style questions across HSC and university subjects, marked instantly with step-by-step feedback.",icon:(
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        <rect x="10" y="10" width="60" height="60" rx="8" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none"/>
        <rect x="20" y="20" width="40" height="6" rx="2" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none"/>
        <rect x="20" y="32" width="28" height="6" rx="2" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none"/>
        <rect x="20" y="44" width="34" height="6" rx="2" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none"/>
        <circle cx="58" cy="58" r="10" stroke="rgba(0,200,150,0.4)" strokeWidth="1.5" fill="none"/>
        <path d="M54 58l3 3 6-6" stroke="rgba(0,200,150,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    )},
    {fig:"FIG 0.2",title:"Built for students",desc:"WAM calculator, HSC mark estimator, and a timetable planner — every tool a UNSW or HSC student needs in one place.",icon:(
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        <rect x="15" y="15" width="22" height="22" rx="4" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none"/>
        <rect x="43" y="15" width="22" height="22" rx="4" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none"/>
        <rect x="15" y="43" width="22" height="22" rx="4" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none"/>
        <rect x="43" y="43" width="22" height="22" rx="4" stroke="rgba(99,102,241,0.4)" strokeWidth="1.5" fill="none"/>
        <path d="M49 54h10M54 49v10" stroke="rgba(99,102,241,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    )},
    {fig:"FIG 0.3",title:"Track your progress",desc:"Every attempt is saved. See your accuracy, marks earned, and study streaks — all synced to your account.",icon:(
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        <rect x="10" y="10" width="60" height="60" rx="8" stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="none"/>
        <path d="M20 55 L32 38 L44 45 L56 25" stroke="rgba(0,200,150,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="20" cy="55" r="2.5" fill="rgba(0,200,150,0.4)"/>
        <circle cx="32" cy="38" r="2.5" fill="rgba(0,200,150,0.4)"/>
        <circle cx="44" cy="45" r="2.5" fill="rgba(0,200,150,0.4)"/>
        <circle cx="56" cy="25" r="2.5" fill="rgba(0,200,150,0.7)"/>
      </svg>
    )},
  ];
  return(
    <div style={{marginTop:"80px",paddingTop:"60px",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
      <p style={{fontSize:"26px",fontWeight:"700",color:"rgba(255,255,255,0.9)",fontFamily:"Georgia,serif",letterSpacing:"-0.02em",marginBottom:"8px",lineHeight:1.3}}>
        Study smarter. <span style={{color:"rgba(255,255,255,0.35)"}}>Not just harder.</span>
      </p>
      <p style={{fontSize:"14px",color:"rgba(255,255,255,0.35)",marginBottom:"48px"}}>Everything you need to practise, check, and track — in one place.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"1px",background:"rgba(255,255,255,0.06)",borderRadius:"16px",overflow:"hidden"}}>
        {features.map((f,i)=>(
          <div key={i} style={{background:"#0a1020",padding:"32px 28px",display:"flex",flexDirection:"column",gap:"24px",transition:"background 0.2s"}}
            onMouseEnter={e=>e.currentTarget.style.background="#0d1528"}
            onMouseLeave={e=>e.currentTarget.style.background="#0a1020"}>
            <div style={{fontSize:"10px",color:"rgba(255,255,255,0.2)",letterSpacing:"0.15em",fontFamily:"monospace"}}>{f.fig}</div>
            <div style={{opacity:0.8}}>{f.icon}</div>
            <div>
              <div style={{fontSize:"14px",fontWeight:"700",color:"rgba(255,255,255,0.85)",marginBottom:"8px"}}>{f.title}</div>
              <div style={{fontSize:"13px",color:"rgba(255,255,255,0.35)",lineHeight:1.7}}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default function App(){
  const[page,setPage]=useState("checker");
  const[calcTab,setCalcTab]=useState("wam");
  const[user,setUser]=useState(null);
  const[authLoading,setAuthLoading]=useState(true);

  useEffect(()=>{
    loadFirebase().then(()=>{
      fbAuth.onAuthStateChanged(u=>{
        setUser(u);
        setAuthLoading(false);
      });
    }).catch(()=>setAuthLoading(false));
  },[]);

  const signInWithGoogle=async()=>{
    await loadFirebase();
    const provider=new window.firebase.auth.GoogleAuthProvider();
    try{await fbAuth.signInWithPopup(provider);}catch(e){console.error(e);}
  };

  const signOut=async()=>{
    await loadFirebase();
    fbAuth.signOut();
  };

  const T=THEMES["dark"];

  useEffect(()=>{
    if(!document.getElementById('katex-css')){
      const link=document.createElement('link');
      link.id='katex-css';link.rel='stylesheet';
      link.href='https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css';
      document.head.appendChild(link);
    }
    if(!document.getElementById('katex-js')){
      const s1=document.createElement('script');
      s1.id='katex-js';
      s1.src='https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js';
      s1.onload=()=>{
        const s2=document.createElement('script');
        s2.id='katex-ar';
        s2.src='https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/contrib/auto-render.min.js';
        document.head.appendChild(s2);
      };
      document.head.appendChild(s1);
    }
  },[]);

  useEffect(()=>{
    const c=document.getElementById('stars-canvas');
    if(!c)return;
    const x=c.getContext('2d');
    let W=window.innerWidth,H=window.innerHeight;
    c.width=W;c.height=H;
    const layers=[
  Array.from({length:120},()=>({px:Math.random()*W,py:Math.random()*H,r:Math.random()*0.8+0.1,o:Math.random()*0.4+0.1,speed:Math.random()*0.008+0.003,dir:Math.random()>0.5?1:-1,vx:-0.4})),
  Array.from({length:60},()=>({px:Math.random()*W,py:Math.random()*H,r:Math.random()*1.2+0.4,o:Math.random()*0.5+0.15,speed:Math.random()*0.010+0.005,dir:Math.random()>0.5?1:-1,vx:-0.9})),
  Array.from({length:20},()=>({px:Math.random()*W,py:Math.random()*H,r:Math.random()*1.8+0.8,o:Math.random()*0.6+0.2,speed:Math.random()*0.012+0.006,dir:Math.random()>0.5?1:-1,vx:-1.6})),
];
    const nebulae=[
      {x:W*0.15,y:H*0.3,r:300,color:"59,130,246"},
      {x:W*0.82,y:H*0.18,r:240,color:"139,92,246"},
      {x:W*0.6,y:H*0.75,r:280,color:"0,200,150"},
      {x:W*0.25,y:H*0.82,r:200,color:"236,72,153"},
    ];
    let raf,t=0;
const draw=()=>{
  t+=0.008;
  x.clearRect(0,0,W,H);

  // Aurora wave
  for(let wave=0;wave<3;wave++){
    const yBase=H*(0.55+wave*0.06);
    const amp=H*0.07;
    const freq=0.0018+wave*0.0004;
    const phase=t*(0.4+wave*0.15);
    const colors=[
      ["rgba(99,102,241,","rgba(139,92,246,"],
      ["rgba(0,200,150,","rgba(59,130,246,"],
      ["rgba(236,72,153,","rgba(99,102,241,"],
    ][wave];
    x.beginPath();
    x.moveTo(0,H);
    for(let px=0;px<=W;px+=4){
      const py=yBase+Math.sin(px*freq+phase)*amp+Math.sin(px*freq*1.7+phase*1.3)*amp*0.4;
      px===0?x.moveTo(px,py):x.lineTo(px,py);
    }
    x.lineTo(W,H);x.lineTo(0,H);x.closePath();
    const grad=x.createLinearGradient(0,yBase-amp,0,yBase+amp*2);
    grad.addColorStop(0,colors[0]+"0.18)");
    grad.addColorStop(0.5,colors[1]+"0.10)");
    grad.addColorStop(1,colors[0]+"0)");
    x.fillStyle=grad;
    x.fill();
  }

  // Nebulae
  nebulae.forEach(n=>{
    const g=x.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r);
    g.addColorStop(0,`rgba(${n.color},0.07)`);
    g.addColorStop(0.5,`rgba(${n.color},0.025)`);
    g.addColorStop(1,`rgba(${n.color},0)`);
    x.fillStyle=g;
    x.beginPath();x.arc(n.x,n.y,n.r,0,Math.PI*2);x.fill();
  });

  // Stars
  layers.forEach(layer=>{
    layer.forEach(s=>{
      s.o+=s.speed*s.dir;
      if(s.o>0.8||s.o<0.05)s.dir*=-1;
      s.px+=s.vx;
      if(s.px<0)s.px=W;
      x.beginPath();x.arc(s.px,s.py,s.r,0,Math.PI*2);
      x.fillStyle=`rgba(200,220,255,${s.o.toFixed(2)})`;
      x.fill();
    });
  });
  raf=requestAnimationFrame(draw);
};;
    const draw=()=>{
      x.clearRect(0,0,W,H);
      nebulae.forEach(n=>{
        const g=x.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r);
        g.addColorStop(0,`rgba(${n.color},0.07)`);
        g.addColorStop(0.5,`rgba(${n.color},0.025)`);
        g.addColorStop(1,`rgba(${n.color},0)`);
        x.fillStyle=g;
        x.beginPath();x.arc(n.x,n.y,n.r,0,Math.PI*2);x.fill();
      });
      layers.forEach(layer=>{
        layer.forEach(s=>{
          s.o+=s.speed*s.dir;
          if(s.o>0.8||s.o<0.05)s.dir*=-1;
          s.px+=s.vx;
          if(s.px<0)s.px=W;
          x.beginPath();x.arc(s.px,s.py,s.r,0,Math.PI*2);
          x.fillStyle=`rgba(200,220,255,${s.o.toFixed(2)})`;
          x.fill();
        });
      });
      raf=requestAnimationFrame(draw);
    };
    draw();
    const onResize=()=>{W=window.innerWidth;H=window.innerHeight;c.width=W;c.height=H;};
    window.addEventListener('resize',onResize);
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',onResize);};
  },[]);

  return(
    <>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      <style>{`:root{--c-bg:${T.bg};--c-sf:${T.surface};--c-b:${T.border};--c-bd:${T.borderDark};--c-t:${T.text};--c-tm:${T.textMid};--c-tl:${T.textLight};--c-a:${T.accent};--c-ad:${T.accentDark};--c-ab:${T.accentBg};--c-n:${T.navy};--c-nm:${T.navyMid};}*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Inter',sans-serif;background:${T.bg};color:${T.text};}input:focus,select:focus,textarea:focus{border-color:${T.accent}!important;box-shadow:0 0 0 3px rgba(0,200,150,0.12);}input[type=range]{accent-color:${T.accent};}#stars-canvas{position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;}nav,main,footer,.hero-section{position:relative;z-index:1;}`}</style>
      <canvas id="stars-canvas"></canvas>

      <nav style={{position:"sticky",top:0,zIndex:100,background:T.bg,borderBottom:`1px solid ${T.border}`,boxShadow:"0 1px 3px rgba(0,0,0,0.06)"}}>
        <div style={{maxWidth:"1100px",margin:"0 auto",padding:"0 24px",height:"60px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",cursor:"pointer",gap:"8px"}} onClick={()=>setPage("checker")}>
            <span style={{fontSize:"20px",fontWeight:"800",color:"#ffffff",letterSpacing:"-0.02em",fontFamily:"Georgia,serif"}}>Vortex</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"4px"}}>
            {[{id:"checker",label:"AI Checker"},{id:"calculators",label:"Calculators"},{id:"timetable",label:"Timetable"},...(user?[{id:"dashboard",label:"Dashboard"},{id:"progress",label:"Progress"}]:[])].map(({id,label})=>(
              <button key={id} onClick={()=>setPage(id)} style={{padding:"8px 16px",borderRadius:"8px",border:"none",fontFamily:"inherit",fontSize:"14px",fontWeight:"600",cursor:"pointer",transition:"all 0.15s",
                background:page===id?T.accentBg:"transparent",
                color:page===id?T.accentDark:T.textMid}}>
                {label}
              </button>
            ))}
            {!authLoading&&(user?(
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginLeft:"4px"}}>
                {user.photoURL
                  ?<img src={user.photoURL} alt="" style={{width:"30px",height:"30px",borderRadius:"50%",border:`2px solid ${T.accent}`}}/>
                  :<div style={{width:"30px",height:"30px",borderRadius:"50%",background:T.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",fontWeight:"700",color:"#fff"}}>{user.displayName?.[0]||"U"}</div>
                }
                <button onClick={signOut} style={{padding:"6px 10px",borderRadius:"8px",border:`1px solid ${T.border}`,background:"transparent",color:T.textMid,fontSize:"12px",fontWeight:"600",cursor:"pointer",fontFamily:"inherit"}}>Sign out</button>
              </div>
            ):(
              <div style={{display:"flex",alignItems:"center",gap:"6px",marginLeft:"4px"}}>
                <button onClick={signInWithGoogle} style={{display:"flex",alignItems:"center",gap:"7px",padding:"7px 13px",borderRadius:"8px",border:`1px solid ${T.border}`,background:"transparent",color:T.textMid,fontSize:"13px",fontWeight:"600",cursor:"pointer",fontFamily:"inherit"}}>
                  Sign in
                </button>
                <button onClick={signInWithGoogle} style={{display:"flex",alignItems:"center",gap:"7px",padding:"7px 13px",borderRadius:"8px",border:"none",background:T.accent,color:"#fff",fontSize:"13px",fontWeight:"600",cursor:"pointer",fontFamily:"inherit"}}>
                  Sign up
                </button>
              </div>
            ))}
          </div>
        </div>
      </nav>

      {page==="checker"&&(
        <div style={{background:"linear-gradient(180deg,rgba(0,0,0,0.3) 0%,transparent 100%)",padding:"28px 24px 0",textAlign:"center"}}>
          <div style={{display:"inline-block",background:"rgba(0,200,150,0.12)",border:"1px solid rgba(0,200,150,0.25)",borderRadius:"20px",padding:"4px 14px",fontSize:"11px",fontWeight:"600",color:C.accent,letterSpacing:"0.1em",textTransform:"uppercase"}}>
            Powered by Vortex
          </div>
        </div>
      )}

      {page==="calculators"&&(
        <div style={{background:T.navy,padding:"32px 24px 28px"}}>
          <div style={{maxWidth:"700px",margin:"0 auto"}}>
            <h1 style={{fontSize:"30px",fontWeight:"800",color:"#fff",letterSpacing:"-0.02em",marginBottom:"6px"}}>Calculators</h1>
            <p style={{fontSize:"15px",color:C.textMid}}>WAM · HSC marks · internal rank</p>
          </div>
        </div>
      )}

      {page==="timetable"&&(
        <div style={{background:T.navy,padding:"32px 24px 28px"}}>
          <div style={{maxWidth:"960px",margin:"0 auto"}}>
            <h1 style={{fontSize:"30px",fontWeight:"800",color:"#fff",letterSpacing:"-0.02em",marginBottom:"6px"}}>Timetable Planner</h1>
            <p style={{fontSize:"15px",color:C.textMid}}>Search UNSW courses · click ↗ to open UNSW handbook · build your weekly timetable</p>
          </div>
        </div>
      )}

      <main style={{maxWidth:page==="timetable"?"960px":"700px",margin:"0 auto",padding:"32px 24px 60px"}}>
        {page==="checker"&&<AICheckerTab user={user}/>}
        {page==="dashboard"&&<DashboardTab user={user}/>}
        {page==="progress"&&<ProgressTab user={user}/>}
        {page==="timetable"&&<TimetableTab/>}
        {page==="calculators"&&(
          <>
            <div style={{display:"flex",gap:"6px",marginBottom:"24px",background:C.surface,padding:"4px",borderRadius:"10px",border:`1px solid ${C.border}`}}>
              {[{id:"wam",label:"WAM Calculator"},{id:"hsc",label:"HSC Mark"}].map(({id,label})=>(
                <button key={id} onClick={()=>setCalcTab(id)} style={{flex:1,padding:"9px 0",borderRadius:"7px",border:"none",fontFamily:"inherit",fontSize:"13px",fontWeight:"600",cursor:"pointer",transition:"all 0.15s",
                  background:calcTab===id?C.bg:"transparent",
                  color:calcTab===id?C.text:C.textMid,
                  boxShadow:calcTab===id?"0 1px 3px rgba(0,0,0,0.08)":"none"}}>
                  {label}
                </button>
              ))}
            </div>
            {calcTab==="wam"&&<WAMTab/>}
            {calcTab==="hsc"&&<HSCTab/>}
          </>
        )}
      </main>

      <footer style={{borderTop:`1px solid ${C.border}`,padding:"20px 24px",textAlign:"center",fontSize:"12px",color:C.textLight}}>
        School data from 2025 NSW HSC results (NESA) · Estimates only · Data saved in your browser
      </footer>
    </>
  );
}
