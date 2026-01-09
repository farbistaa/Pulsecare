// client/src/pages/Register.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { UserPlus, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { generatedonorId, isEligibleToDonate, calculateDaysSinceLastDonation } from '@/lib/utils';
import { z } from 'zod';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const genders = ['Male', 'Female', 'Others'];

// Bangladesh administrative divisions data
const divisions = [
  { id: 'dhaka', name: 'Dhaka' },
  { id: 'chittagong', name: 'Chittagong' },
  { id: 'sylhet', name: 'Sylhet' },
  { id: 'rajshahi', name: 'Rajshahi' },
  { id: 'khulna', name: 'Khulna' },
  { id: 'barishal', name: 'Barishal' },
  { id: 'rangpur', name: 'Rangpur' },
  { id: 'mymensingh', name: 'Mymensingh' }
];

// Districts by division
const districtsByDivision: Record<string, { id: string; name: string }[]> = {
  dhaka: [
    { id: 'dhaka', name: 'Dhaka' },
    { id: 'gazipur', name: 'Gazipur' },
    { id: 'narayanganj', name: 'Narayanganj' },
    { id: 'narsingdi', name: 'Narsingdi' },
    { id: 'tangail', name: 'Tangail' },
    { id: 'kishoreganj', name: 'Kishoreganj' },
    { id: 'manikganj', name: 'Manikganj' },
    { id: 'munshiganj', name: 'Munshiganj' },
    { id: 'rajbari', name: 'Rajbari' },
    { id: 'madaripur', name: 'Madaripur' },
    { id: 'gopalganj', name: 'Gopalganj' },
    { id: 'shariatpur', name: 'Shariatpur' },
    { id: 'faridpur', name: 'Faridpur' }
  ],
  chittagong: [
    { id: 'chittagong', name: 'Chittagong' },
    { id: 'comilla', name: 'Comilla' },
    { id: 'feni', name: 'Feni' },
    { id: 'brahmanbaria', name: 'Brahmanbaria' },
    { id: 'rangamati', name: 'Rangamati' },
    { id: 'bandarban', name: 'Bandarban' },
    { id: 'khagrachhari', name: 'Khagrachhari' },
    { id: 'coxbazar', name: "Cox's Bazar" },
    { id: 'lakshmipur', name: 'Lakshmipur' },
    { id: 'noakhali', name: 'Noakhali' },
    { id: 'chandpur', name: 'Chandpur' }
  ],
  sylhet: [
    { id: 'sylhet', name: 'Sylhet' },
    { id: 'moulvibazar', name: 'Moulvibazar' },
    { id: 'habiganj', name: 'Habiganj' },
    { id: 'sunamganj', name: 'Sunamganj' }
  ],
  rajshahi: [
    { id: 'rajshahi', name: 'Rajshahi' },
    { id: 'chapainawabganj', name: 'Chapai Nawabganj' },
    { id: 'natore', name: 'Natore' },
    { id: 'naogaon', name: 'Naogaon' },
    { id: 'pabna', name: 'Pabna' },
    { id: 'bogura', name: 'Bogura' },
    { id: 'sirajganj', name: 'Sirajganj' },
    { id: 'joypurhat', name: 'Joypurhat' }
  ],
  khulna: [
    { id: 'khulna', name: 'Khulna' },
    { id: 'bagerhat', name: 'Bagerhat' },
    { id: 'chuadanga', name: 'Chuadanga' },
    { id: 'jessore', name: 'Jessore' },
    { id: 'jhenaidah', name: 'Jhenaidah' },
    { id: 'kushtia', name: 'Kushtia' },
    { id: 'magura', name: 'Magura' },
    { id: 'meherpur', name: 'Meherpur' },
    { id: 'narail', name: 'Narail' },
    { id: 'satkhira', name: 'Satkhira' }
  ],
  barishal: [
    { id: 'barishal', name: 'Barishal' },
    { id: 'barguna', name: 'Barguna' },
    { id: 'bhola', name: 'Bhola' },
    { id: 'jhalokathi', name: 'Jhalokathi' },
    { id: 'patuakhali', name: 'Patuakhali' },
    { id: 'pirojpur', name: 'Pirojpur' }
  ],
  rangpur: [
    { id: 'rangpur', name: 'Rangpur' },
    { id: 'dinajpur', name: 'Dinajpur' },
    { id: 'gaibandha', name: 'Gaibandha' },
    { id: 'kurigram', name: 'Kurigram' },
    { id: 'lalmonirhat', name: 'Lalmonirhat' },
    { id: 'nilphamari', name: 'Nilphamari' },
    { id: 'panchagarh', name: 'Panchagarh' },
    { id: 'thakurgaon', name: 'Thakurgaon' }
  ],
  mymensingh: [
    { id: 'mymensingh', name: 'Mymensingh' },
    { id: 'jamalpur', name: 'Jamalpur' },
    { id: 'netrokona', name: 'Netrokona' },
    { id: 'sherpur', name: 'Sherpur' }
  ]
};

// Complete upazila data for all districts
const upazilasByDistrict: Record<string, { id: string; name: string }[]> = {
  // Barishal Division Districts
  barishal: [
    { id: 'barishal-sadar', name: 'Barishal Sadar' },
    { id: 'babuganj', name: 'Babuganj' },
    { id: 'bakerganj', name: 'Bakerganj' },
    { id: 'banaripara', name: 'Banaripara' },
    { id: 'gournadi', name: 'Gournadi' },
    { id: 'hizla', name: 'Hizla' },
    { id: 'mehendiganj', name: 'Mehendiganj' },
    { id: 'muladi', name: 'Muladi' },
    { id: 'wazirpur', name: 'Wazirpur' }
  ],
  barguna: [
    { id: 'barguna-sadar', name: 'Barguna Sadar' },
    { id: 'amtali', name: 'Amtali' },
    { id: 'bamna', name: 'Bamna' },
    { id: 'betagi', name: 'Betagi' },
    { id: 'patharghata', name: 'Patharghata' },
    { id: 'taltali', name: 'Taltali' }
  ],
  bhola: [
    { id: 'bhola-sadar', name: 'Bhola Sadar' },
    { id: 'borhanuddin', name: 'Borhanuddin' },
    { id: 'charfasson', name: 'Charfasson' },
    { id: 'daulatkhan', name: 'Daulatkhan' },
    { id: 'lalmohan', name: 'Lalmohan' },
    { id: 'manpura', name: 'Manpura' },
    { id: 'tazumuddin', name: 'Tazumuddin' }
  ],
  jhalokathi: [
    { id: 'jhalokathi-sadar', name: 'Jhalokathi Sadar' },
    { id: 'kathalia', name: 'Kathalia' },
    { id: 'nalchity', name: 'Nalchity' },
    { id: 'rajapur', name: 'Rajapur' }
  ],
  patuakhali: [
    { id: 'patuakhali-sadar', name: 'Patuakhali Sadar' },
    { id: 'bauphal', name: 'Bauphal' },
    { id: 'dashmina', name: 'Dashmina' },
    { id: 'dumki', name: 'Dumki' },
    { id: 'galachipa', name: 'Galachipa' },
    { id: 'kalapara', name: 'Kalapara' },
    { id: 'mirzaganj', name: 'Mirzaganj' },
    { id: 'rangabali', name: 'Rangabali' }
  ],
  pirojpur: [
    { id: 'pirojpur-sadar', name: 'Pirojpur Sadar' },
    { id: 'bhandaria', name: 'Bhandaria' },
    { id: 'kawkhali', name: 'Kawkhali' },
    { id: 'mathbaria', name: 'Mathbaria' },
    { id: 'nesarabad', name: 'Nesarabad' },
    { id: 'nazirpur', name: 'Nazirpur' },
    { id: 'zianagar', name: 'Zianagar' }
  ],
  
  // Dhaka Division Districts
  dhaka: [
    { id: 'dhamrai', name: 'Dhamrai' },
    { id: 'dohar', name: 'Dohar' },
    { id: 'keraniganj', name: 'Keraniganj' },
    { id: 'nawabganj', name: 'Nawabganj' },
    { id: 'savar', name: 'Savar' }
  ],
  gazipur: [
    { id: 'gazipur-sadar', name: 'Gazipur Sadar' },
    { id: 'kaliakair', name: 'Kaliakair' },
    { id: 'kapasia', name: 'Kapasia' },
    { id: 'sreepur', name: 'Sreepur' },
    { id: 'kaliganj', name: 'Kaliganj' }
  ],
  narayanganj: [
    { id: 'narayanganj-sadar', name: 'Narayanganj Sadar' },
    { id: 'araihazar', name: 'Araihazar' },
    { id: 'bandar', name: 'Bandar' },
    { id: 'narayanganj', name: 'Narayanganj' },
    { id: 'rupganj', name: 'Rupganj' },
    { id: 'sonargaon', name: 'Sonargaon' }
  ],
  narsingdi: [
    { id: 'narsingdi-sadar', name: 'Narsingdi Sadar' },
    { id: 'belabo', name: 'Belabo' },
    { id: 'monohardi', name: 'Monohardi' },
    { id: 'narsingdi', name: 'Narsingdi' },
    { id: 'palash', name: 'Palash' },
    { id: 'raipura', name: 'Raipura' },
    { id: 'shibpur', name: 'Shibpur' }
  ],
  tangail: [
    { id: 'tangail-sadar', name: 'Tangail Sadar' },
    { id: 'basail', name: 'Basail' },
    { id: 'bhuapur', name: 'Bhuapur' },
    { id: 'delduar', name: 'Delduar' },
    { id: 'dhanbari', name: 'Dhanbari' },
    { id: 'ghatail', name: 'Ghatail' },
    { id: 'gopalpur', name: 'Gopalpur' },
    { id: 'kalihati', name: 'Kalihati' },
    { id: 'madhupur', name: 'Madhupur' },
    { id: 'mirzapur', name: 'Mirzapur' },
    { id: 'nagarpur', name: 'Nagarpur' },
    { id: 'sakhipur', name: 'Sakhipur' }
  ],
  kishoreganj: [
    { id: 'kishoreganj-sadar', name: 'Kishoreganj Sadar' },
    { id: 'austagram', name: 'Austagram' },
    { id: 'bajitpur', name: 'Bajitpur' },
    { id: 'bhairab', name: 'Bhairab' },
    { id: 'hossainpur', name: 'Hossainpur' },
    { id: 'itna', name: 'Itna' },
    { id: 'karimganj', name: 'Karimganj' },
    { id: 'katiadi', name: 'Katiadi' },
    { id: 'kishoreganj', name: 'Kishoreganj' },
    { id: 'mithamain', name: 'Mithamain' },
    { id: 'nikli', name: 'Nikli' },
    { id: 'pakundia', name: 'Pakundia' },
    { id: 'tarail', name: 'Tarail' }
  ],
  manikganj: [
    { id: 'manikganj-sadar', name: 'Manikganj Sadar' },
    { id: 'daulatpur', name: 'Daulatpur' },
    { id: 'ghior', name: 'Ghior' },
    { id: 'harirampur', name: 'Harirampur' },
    { id: 'manikganj-sadar', name: 'Manikganj Sadar' },
    { id: 'saturia', name: 'Saturia' },
    { id: 'shivalaya', name: 'Shivalaya' },
    { id: 'singair', name: 'Singair' }
  ],
  munshiganj: [
    { id: 'munshiganj-sadar', name: 'Munshiganj Sadar' },
    { id: 'gazaria', name: 'Gazaria' },
    { id: 'lohajang', name: 'Lohajang' },
    { id: 'munshiganj-sadar', name: 'Munshiganj Sadar' },
    { id: 'sirajdikhan', name: 'Sirajdikhan' },
    { id: 'sreenagar', name: 'Sreenagar' },
    { id: 'tongibari', name: 'Tongibari' }
  ],
  rajbari: [
    { id: 'rajbari-sadar', name: 'Rajbari Sadar' },
    { id: 'goalanda', name: 'Goalanda' },
    { id: 'pangsha', name: 'Pangsha' },
    { id: 'kalukhali', name: 'Kalukhali' }
  ],
  madaripur: [
    { id: 'madaripur-sadar', name: 'Madaripur Sadar' },
    { id: 'kalkini', name: 'Kalkini' },
    { id: 'madharipur', name: 'Madharipur' },
    { id: 'rajoir', name: 'Rajoir' },
    { id: 'shibchar', name: 'Shibchar' }
  ],
  gopalganj: [
    { id: 'gopalganj-sadar', name: 'Gopalganj Sadar' },
    { id: 'kashiani', name: 'Kashiani' },
    { id: 'kotalipara', name: 'Kotalipara' },
    { id: 'muksudpur', name: 'Muksudpur' },
    { id: 'sadar-upazila', name: 'Sadar Upazila' },
    { id: 'tungipara', name: 'Tungipara' }
  ],
  shariatpur: [
    { id: 'shariatpur-sadar', name: 'Shariatpur Sadar' },
    { id: 'bhedarganj', name: 'Bhedarganj' },
    { id: 'damudya', name: 'Damudya' },
    { id: 'gosairhat', name: 'Gosairhat' },
    { id: 'naria', name: 'Naria' },
    { id: 'shariatpur-sadar', name: 'Shariatpur Sadar' },
    { id: 'zanjira', name: 'Zanjira' }
  ],
  faridpur: [
    { id: 'faridpur-sadar', name: 'Faridpur Sadar' },
    { id: 'alfadanga', name: 'Alfadanga' },
    { id: 'bhanga', name: 'Bhanga' },
    { id: 'boalmari', name: 'Boalmari' },
    { id: 'charbhadrasan', name: 'Charbhadrasan' },
    { id: 'faridpur-sadar', name: 'Faridpur Sadar' },
    { id: 'madhukhali', name: 'Madhukhali' },
    { id: 'nagarkanda', name: 'Nagarkanda' },
    { id: 'saltha', name: 'Saltha' }
  ],
  
  // Chittagong Division Districts
  chittagong: [
    { id: 'anwara', name: 'Anwara' },
    { id: 'banshkhali', name: 'Banshkhali' },
    { id: 'boalkhali', name: 'Boalkhali' },
    { id: 'chandanaish', name: 'Chandanaish' },
    { id: 'fatikchhari', name: 'Fatikchhari' },
    { id: 'hathazari', name: 'Hathazari' },
    { id: 'lohagara', name: 'Lohagara' },
    { id: 'mirsharai', name: 'Mirsharai' },
    { id: 'patiya', name: 'Patiya' },
    { id: 'rangunia', name: 'Rangunia' },
    { id: 'raozan', name: 'Raozan' },
    { id: 'sandwip', name: 'Sandwip' },
    { id: 'satkania', name: 'Satkania' },
    { id: 'sitakunda', name: 'Sitakunda' }
  ],
  comilla: [
    { id: 'comilla-sadar', name: 'Comilla Sadar' },
    { id: 'barura', name: 'Barura' },
    { id: 'brahmanpara', name: 'Brahmanpara' },
    { id: 'burichang', name: 'Burichang' },
    { id: 'chandina', name: 'Chandina' },
    { id: 'chauddagram', name: 'Chauddagram' },
    { id: 'daudkandi', name: 'Daudkandi' },
    { id: 'debidwar', name: 'Debidwar' },
    { id: 'homna', name: 'Homna' },
    { id: 'laksam', name: 'Laksam' },
    { id: 'monohorganj', name: 'Monohorganj' },
    { id: 'muradnagar', name: 'Muradnagar' },
    { id: 'nangalkot', name: 'Nangalkot' },
    { id: 'titas', name: 'Titas' }
  ],
  feni: [
    { id: 'feni-sadar', name: 'Feni Sadar' },
    { id: 'chhagalnaiya', name: 'Chhagalnaiya' },
    { id: 'daganbhuiyan', name: 'Daganbhuiyan' },
    { id: 'feni-sadar', name: 'Feni Sadar' },
    { id: 'fulgazi', name: 'Fulgazi' },
    { id: 'parshuram', name: 'Parshuram' },
    { id: 'sonagazi', name: 'Sonagazi' }
  ],
  brahmanbaria: [
    { id: 'brahmanbaria-sadar', name: 'Brahmanbaria Sadar' },
    { id: 'akhaura', name: 'Akhaura' },
    { id: 'bancharampur', name: 'Bancharampur' },
    { id: 'brahmanbaria-sadar', name: 'Brahmanbaria Sadar' },
    { id: 'kasba', name: 'Kasba' },
    { id: 'nasirnagar', name: 'Nasirnagar' },
    { id: 'nabinagar', name: 'Nabinagar' },
    { id: 'sarail', name: 'Sarail' }
  ],
  rangamati: [
    { id: 'rangamati-sadar', name: 'Rangamati Sadar' },
    { id: 'bagaichhari', name: 'Bagaichhari' },
    { id: 'barkal', name: 'Barkal' },
    { id: 'belaichhari', name: 'Belaichhari' },
    { id: 'juraichhari', name: 'Juraichhari' },
    { id: 'kaptai', name: 'Kaptai' },
    { id: 'langadu', name: 'Langadu' },
    { id: 'naniarchar', name: 'Naniarchar' },
    { id: 'rajasthali', name: 'Rajasthali' },
    { id: 'rangamati-sadar', name: 'Rangamati Sadar' }
  ],
  bandarban: [
    { id: 'bandarban-sadar', name: 'Bandarban Sadar' },
    { id: 'alikadam', name: 'Alikadam' },
    { id: 'bandarban-sadar', name: 'Bandarban Sadar' },
    { id: 'lama', name: 'Lama' },
    { id: 'nakyangchari', name: 'Nakyangchari' },
    { id: 'rowangchhari', name: 'Rowangchhari' },
    { id: 'ruma', name: 'Ruma' },
    { id: 'thanchi', name: 'Thanchi' }
  ],
  khagrachhari: [
    { id: 'khagrachhari-sadar', name: 'Khagrachhari Sadar' },
    { id: 'dighinala', name: 'Dighinala' },
    { id: 'khagrachhari-sadar', name: 'Khagrachhari Sadar' },
    { id: 'laxmichhari', name: 'Laxmichhari' },
    { id: 'mahalchhari', name: 'Mahalchhari' },
    { id: 'manikchhari', name: 'Manikchhari' },
    { id: 'matiranga', name: 'Matiranga' },
    { id: 'panchhari', name: 'Panchhari' },
    { id: 'ramgarh', name: 'Ramgarh' }
  ],
  coxbazar: [
    { id: 'coxbazar-sadar', name: "Cox's Bazar Sadar" },
    { id: 'chakoria', name: 'Chakoria' },
    { id: 'coxbazar-sadar', name: "Cox's Bazar Sadar" },
    { id: 'ekushey', name: 'Ekushey' },
    { id: 'kutubdia', name: 'Kutubdia' },
    { id: 'maheshkhali', name: 'Maheshkhali' },
    { id: 'pekua', name: 'Pekua' },
    { id: 'ramu', name: 'Ramu' },
    { id: 'teknaf', name: 'Teknaf' },
    { id: 'ukhia', name: 'Ukhia' }
  ],
  lakshmipur: [
    { id: 'lakshmipur-sadar', name: 'Lakshmipur Sadar' },
    { id: 'raipur', name: 'Raipur' },
    { id: 'lakshmipur-sadar', name: 'Lakshmipur Sadar' },
    { id: 'ramganj', name: 'Ramganj' },
    { id: 'ramgati', name: 'Ramgati' }
  ],
  noakhali: [
    { id: 'noakhali-sadar', name: 'Noakhali Sadar' },
    { id: 'begumganj', name: 'Begumganj' },
    { id: 'chatkhil', name: 'Chatkhil' },
    { id: 'companiganj', name: 'Companiganj' },
    { id: 'hatiya', name: 'Hatiya' },
    { id: 'kabirhat', name: 'Kabirhat' },
    { id: 'noakhali-sadar', name: 'Noakhali Sadar' },
    { id: 'senbagh', name: 'Senbagh' },
    { id: 'sonaimori', name: 'Sonaimori' }
  ],
  chandpur: [
    { id: 'chandpur-sadar', name: 'Chandpur Sadar' },
    { id: 'faridganj', name: 'Faridganj' },
    { id: 'haimchar', name: 'Haimchar' },
    { id: 'haziganj', name: 'Haziganj' },
    { id: 'kachua', name: 'Kachua' },
    { id: 'chandpur-sadar', name: 'Chandpur Sadar' },
    { id: 'matlab', name: 'Matlab' },
    { id: 'shahrasti', name: 'Shahrasti' }
  ],
  
  // Sylhet Division Districts
  sylhet: [
    { id: 'sylhet-sadar', name: 'Sylhet Sadar' },
    { id: 'balaganj', name: 'Balaganj' },
    { id: 'beanibazar', name: 'Beanibazar' },
    { id: 'bishwanath', name: 'Bishwanath' },
    { id: 'companiganj', name: 'Companiganj' },
    { id: 'fenchuganj', name: 'Fenchuganj' },
    { id: 'golapganj', name: 'Golapganj' },
    { id: 'gowainghat', name: 'Gowainghat' },
    { id: 'jaintiapur', name: 'Jaintiapur' },
    { id: 'kanaighat', name: 'Kanaighat' },
    { id: 'zakiganj', name: 'Zakiganj' }
  ],
  moulvibazar: [
    { id: 'moulvibazar-sadar', name: 'Moulvibazar Sadar' },
    { id: 'barlekha', name: 'Barlekha' },
    { id: 'juri', name: 'Juri' },
    { id: 'kamalganj', name: 'Kamalganj' },
    { id: 'kulaura', name: 'Kulaura' },
    { id: 'moulvibazar-sadar', name: 'Moulvibazar Sadar' },
    { id: 'rajnagar', name: 'Rajnagar' },
    { id: 'sreemangal', name: 'Sreemangal' }
  ],
  habiganj: [
    { id: 'habiganj-sadar', name: 'Habiganj Sadar' },
    { id: 'ajmiriganj', name: 'Ajmiriganj' },
    { id: 'baniachang', name: 'Baniachang' },
    { id: 'bahubal', name: 'Bahubal' },
    { id: 'chunarughat', name: 'Chunarughat' },
    { id: 'habiganj-sadar', name: 'Habiganj Sadar' },
    { id: 'lakhai', name: 'Lakhai' },
    { id: 'madhabpur', name: 'Madhabpur' },
    { id: 'nabiganj', name: 'Nabiganj' }
  ],
  sunamganj: [
    { id: 'sunamganj-sadar', name: 'Sunamganj Sadar' },
    { id: 'bishwamvarpur', name: 'Bishwamvarpur' },
    { id: 'chhatak', name: 'Chhatak' },
    { id: 'dakshin-sunamganj', name: 'Dakshin Sunamganj' },
    { id: 'derai', name: 'Derai' },
    { id: 'dharamapasha', name: 'Dharamapasha' },
    { id: 'dowarabazar', name: 'Dowarabazar' },
    { id: 'jagannathpur', name: 'Jagannathpur' },
    { id: 'jamalganj', name: 'Jamalganj' },
    { id: 'sullah', name: 'Sullah' },
    { id: 'sunamganj-sadar', name: 'Sunamganj Sadar' },
    { id: 'tahirpur', name: 'Tahirpur' }
  ],
  
  // Rajshahi Division Districts
  rajshahi: [
    { id: 'rajshahi-sadar', name: 'Rajshahi Sadar' },
    { id: 'bagha', name: 'Bagha' },
    { id: 'charghat', name: 'Charghat' },
    { id: 'durgapur', name: 'Durgapur' },
    { id: 'godagari', name: 'Godagari' },
    { id: 'mohanpur', name: 'Mohanpur' },
    { id: 'paba', name: 'Paba' },
    { id: 'puthia', name: 'Puthia' }
  ],
  chapainawabganj: [
    { id: 'chapainawabganj-sadar', name: 'Chapai Nawabganj Sadar' },
    { id: 'bholahat', name: 'Bholahat' },
    { id: 'gomastapur', name: 'Gomastapur' },
    { id: 'nachole', name: 'Nachole' },
    { id: 'niamatpur', name: 'Niamatpur' },
    { id: 'shibganj', name: 'Shibganj' }
  ],
  natore: [
    { id: 'natore-sadar', name: 'Natore Sadar' },
    { id: 'bagatipara', name: 'Bagatipara' },
    { id: 'baraigram', name: 'Baraigram' },
    { id: 'gurudaspur', name: 'Gurudaspur' },
    { id: 'lalpur', name: 'Lalpur' },
    { id: 'natore-sadar', name: 'Natore Sadar' },
    { id: 'singra', name: 'Singra' }
  ],
  naogaon: [
    { id: 'naogaon-sadar', name: 'Naogaon Sadar' },
    { id: 'atrai', name: 'Atrai' },
    { id: 'badalgachhi', name: 'Badalgachhi' },
    { id: 'dhamoirhat', name: 'Dhamoirhat' },
    { id: 'manda', name: 'Manda' },
    { id: 'mohadevpur', name: 'Mohadevpur' },
    { id: 'naogaon-sadar', name: 'Naogaon Sadar' },
    { id: 'niamatpur', name: 'Niamatpur' },
    { id: 'patnitala', name: 'Patnitala' },
    { id: 'porsha', name: 'Porsha' },
    { id: 'raninagar', name: 'Raninagar' },
    { id: 'sapahar', name: 'Sapahar' }
  ],
  pabna: [
    { id: 'pabna-sadar', name: 'Pabna Sadar' },
    { id: 'atgharia', name: 'Atgharia' },
    { id: 'bera', name: 'Bera' },
    { id: 'bhangura', name: 'Bhangura' },
    { id: 'chatmohar', name: 'Chatmohar' },
    { id: 'faridpur', name: 'Faridpur' },
    { id: 'ishwardi', name: 'Ishwardi' },
    { id: 'pabna-sadar', name: 'Pabna Sadar' },
    { id: 'sujanagar', name: 'Sujanagar' }
  ],
  bogura: [
    { id: 'bogura-sadar', name: 'Bogura Sadar' },
    { id: 'adamdighi', name: 'Adamdighi' },
    { id: 'dhunat', name: 'Dhunat' },
    { id: 'dupchanchia', name: 'Dupchanchia' },
    { id: 'gabtali', name: 'Gabtali' },
    { id: 'kahaloo', name: 'Kahaloo' },
    { id: 'nandigram', name: 'Nandigram' },
    { id: 'shibganj', name: 'Shibganj' },
    { id: 'sherpur', name: 'Sherpur' },
    { id: 'shajahanpur', name: 'Shajahanpur' },
    { id: 'sonatala', name: 'Sonatala' }
  ],
  sirajganj: [
    { id: 'sirajganj-sadar', name: 'Sirajganj Sadar' },
    { id: 'belkuchi', name: 'Belkuchi' },
    { id: 'chauhali', name: 'Chauhali' },
    { id: 'kamarkhand', name: 'Kamarkhand' },
    { id: 'kazipur', name: 'Kazipur' },
    { id: 'raiganj', name: 'Raiganj' },
    { id: 'shahjadpur', name: 'Shahjadpur' },
    { id: 'sirajganj-sadar', name: 'Sirajganj Sadar' },
    { id: 'ullapara', name: 'Ullapara' }
  ],
  joypurhat: [
    { id: 'joypurhat-sadar', name: 'Joypurhat Sadar' },
    { id: 'akkelpur', name: 'Akkelpur' },
    { id: 'joypurhat-sadar', name: 'Joypurhat Sadar' },
    { id: 'kalai', name: 'Kalai' },
    { id: 'khetlal', name: 'Khetlal' },
    { id: 'panchbibi', name: 'Panchbibi' }
  ],
  
  // Khulna Division Districts
  khulna: [
    { id: 'khulna-sadar', name: 'Khulna Sadar' },
    { id: 'batiaghata', name: 'Batiaghata' },
    { id: 'dacope', name: 'Dacope' },
    { id: 'dumuria', name: 'Dumuria' },
    { id: 'digholia', name: 'Digholia' },
    { id: 'koyra', name: 'Koyra' },
    { id: 'paikgacha', name: 'Paikgacha' },
    { id: 'phultala', name: 'Phultala' },
    { id: 'rupsa', name: 'Rupsa' },
    { id: 'terokhada', name: 'Terokhada' }
  ],
  bagerhat: [
    { id: 'bagerhat-sadar', name: 'Bagerhat Sadar' },
    { id: 'chitalmari', name: 'Chitalmari' },
    { id: 'fakirhat', name: 'Fakirhat' },
    { id: 'kachua', name: 'Kachua' },
    { id: 'mollahat', name: 'Mollahat' },
    { id: 'mongla', name: 'Mongla' },
    { id: 'morrelganj', name: 'Morrelganj' },
    { id: 'rampal', name: 'Rampal' },
    { id: 'sarankhola', name: 'Sarankhola' }
  ],
  chuadanga: [
    { id: 'chuadanga-sadar', name: 'Chuadanga Sadar' },
    { id: 'alamdanga', name: 'Alamdanga' },
    { id: 'chuadanga-sadar', name: 'Chuadanga Sadar' },
    { id: 'jibannagar', name: 'Jibannagar' },
    { id: 'damurhuda', name: 'Damurhuda' }
  ],
  jessore: [
    { id: 'jessore-sadar', name: 'Jessore Sadar' },
    { id: 'abhaynagar', name: 'Abhaynagar' },
    { id: 'bagherpara', name: 'Bagherpara' },
    { id: 'chaugachha', name: 'Chaugachha' },
    { id: 'jessore-sadar', name: 'Jessore Sadar' },
    { id: 'jhikargachha', name: 'Jhikargachha' },
    { id: 'keshabpur', name: 'Keshabpur' },
    { id: 'manirampur', name: 'Manirampur' },
    { id: 'sharsha', name: 'Sharsha' }
  ],
  jhenaidah: [
    { id: 'jhenaidah-sadar', name: 'Jhenaidah Sadar' },
    { id: 'harinakunda', name: 'Harinakunda' },
    { id: 'jhenaidah-sadar', name: 'Jhenaidah Sadar' },
    { id: 'kaliganj', name: 'Kaliganj' },
    { id: 'kotchandpur', name: 'Kotchandpur' },
    { id: 'maheshpur', name: 'Maheshpur' },
    { id: 'shailkupa', name: 'Shailkupa' }
  ],
  kushtia: [
    { id: 'kushtia-sadar', name: 'Kushtia Sadar' },
    { id: 'bheramara', name: 'Bheramara' },
    { id: 'daulatpur', name: 'Daulatpur' },
    { id: 'khoksa', name: 'Khoksa' },
    { id: 'kumarkhali', name: 'Kumarkhali' },
    { id: 'kushtia-sadar', name: 'Kushtia Sadar' },
    { id: 'mirpur', name: 'Mirpur' }
  ],
  magura: [
    { id: 'magura-sadar', name: 'Magura Sadar' },
    { id: 'magura-sadar', name: 'Magura Sadar' },
    { id: 'mohammadpur', name: 'Mohammadpur' },
    { id: 'shalikha', name: 'Shalikha' },
    { id: 'sreepur', name: 'Sreepur' }
  ],
  meherpur: [
    { id: 'meherpur-sadar', name: 'Meherpur Sadar' },
    { id: 'gangni', name: 'Gangni' },
    { id: 'meherpur-sadar', name: 'Meherpur Sadar' },
    { id: 'mujibnagar', name: 'Mujibnagar' }
  ],
  narail: [
    { id: 'narail-sadar', name: 'Narail Sadar' },
    { id: 'kalia', name: 'Kalia' },
    { id: 'lohagara', name: 'Lohagara' },
    { id: 'narail-sadar', name: 'Narail Sadar' }
  ],
  satkhira: [
    { id: 'satkhira-sadar', name: 'Satkhira Sadar' },
    { id: 'assasuni', name: 'Assasuni' },
    { id: 'debhata', name: 'Debhata' },
    { id: 'kalaroa', name: 'Kalaroa' },
    { id: 'satkhira-sadar', name: 'Satkhira Sadar' },
    { id: 'shyamnagar', name: 'Shyamnagar' },
    { id: 'tala', name: 'Tala' },
    { id: 'kaliganj', name: 'Kaliganj' }
  ],
  
  // Rangpur Division Districts
  rangpur: [
    { id: 'rangpur-sadar', name: 'Rangpur Sadar' },
    { id: 'badarganj', name: 'Badarganj' },
    { id: 'gangachara', name: 'Gangachara' },
    { id: 'kaunia', name: 'Kaunia' },
    { id: 'rangpur-sadar', name: 'Rangpur Sadar' },
    { id: 'mithapukur', name: 'Mithapukur' },
    { id: 'pirganj', name: 'Pirganj' },
    { id: 'pirgachha', name: 'Pirgachha' },
    { id: 'taraganj', name: 'Taraganj' }
  ],
  dinajpur: [
    { id: 'dinajpur-sadar', name: 'Dinajpur Sadar' },
    { id: 'birampur', name: 'Birampur' },
    { id: 'birganj', name: 'Birganj' },
    { id: 'bochaganj', name: 'Bochaganj' },
    { id: 'chirirbandar', name: 'Chirirbandar' },
    { id: 'phulbari', name: 'Phulbari' },
    { id: 'dinajpur-sadar', name: 'Dinajpur Sadar' },
    { id: 'ghoraghat', name: 'Ghoraghat' },
    { id: 'hakimpur', name: 'Hakimpur' },
    { id: 'kaharole', name: 'Kaharole' },
    { id: 'khansama', name: 'Khansama' },
    { id: 'nawabganj', name: 'Nawabganj' },
    { id: 'parbatipur', name: 'Parbatipur' }
  ],
  gaibandha: [
    { id: 'gaibandha-sadar', name: 'Gaibandha Sadar' },
    { id: 'fulchhari', name: 'Fulchhari' },
    { id: 'gobindaganj', name: 'Gobindaganj' },
    { id: 'gaibandha-sadar', name: 'Gaibandha Sadar' },
    { id: 'palashbari', name: 'Palashbari' },
    { id: 'sadullapur', name: 'Sadullapur' },
    { id: 'sughatta', name: 'Sughatta' }
  ],
  kurigram: [
    { id: 'kurigram-sadar', name: 'Kurigram Sadar' },
    { id: 'bhurungamari', name: 'Bhurungamari' },
    { id: 'char-rajibpur', name: 'Char Rajibpur' },
    { id: 'chilmari', name: 'Chilmari' },
    { id: 'phulbari', name: 'Phulbari' },
    { id: 'kurigram-sadar', name: 'Kurigram Sadar' },
    { id: 'nageshwari', name: 'Nageshwari' },
    { id: 'rajarhat', name: 'Rajarhat' },
    { id: 'raomari', name: 'Raomari' },
    { id: 'ulipur', name: 'Ulipur' }
  ],
  lalmonirhat: [
    { id: 'lalmonirhat-sadar', name: 'Lalmonirhat Sadar' },
    { id: 'aditmari', name: 'Aditmari' },
    { id: 'hatibandha', name: 'Hatibandha' },
    { id: 'kaliganj', name: 'Kaliganj' },
    { id: 'lalmonirhat-sadar', name: 'Lalmonirhat Sadar' },
    { id: 'patgram', name: 'Patgram' }
  ],
  nilphamari: [
    { id: 'nilphamari-sadar', name: 'Nilphamari Sadar' },
    { id: 'dimla', name: 'Dimla' },
    { id: 'domar', name: 'Domar' },
    { id: 'jaldhaka', name: 'Jaldhaka' },
    { id: 'kishoreganj', name: 'Kishoreganj' },
    { id: 'nilphamari-sadar', name: 'Nilphamari Sadar' },
    { id: 'syedpur', name: 'Syedpur' }
  ],
  panchagarh: [
    { id: 'panchagarh-sadar', name: 'Panchagarh Sadar' },
    { id: 'atwari', name: 'Atwari' },
    { id: 'boda', name: 'Boda' },
    { id: 'debiganj', name: 'Debiganj' },
    { id: 'panchagarh-sadar', name: 'Panchagarh Sadar' },
    { id: 'tetulia', name: 'Tetulia' }
  ],
  thakurgaon: [
    { id: 'thakurgaon-sadar', name: 'Thakurgaon Sadar' },
    { id: 'baliadangi', name: 'Baliadangi' },
    { id: 'haripur', name: 'Haripur' },
    { id: 'pirganj', name: 'Pirganj' },
    { id: 'ranisankail', name: 'Ranisankail' },
    { id: 'thakurgaon-sadar', name: 'Thakurgaon Sadar' }
  ],
  
  // Mymensingh Division Districts
  mymensingh: [
    { id: 'mymensingh-sadar', name: 'Mymensingh Sadar' },
    { id: 'bhaluka', name: 'Bhaluka' },
    { id: 'dhobaura', name: 'Dhobaura' },
    { id: 'fulbaria', name: 'Fulbaria' },
    { id: 'gaffargaon', name: 'Gaffargaon' },
    { id: 'gauripur', name: 'Gauripur' },
    { id: 'haluaghat', name: 'Haluaghat' },
    { id: 'ishwarganj', name: 'Ishwarganj' },
    { id: 'muktagachha', name: 'Muktagachha' },
    { id: 'mymensingh-sadar', name: 'Mymensingh Sadar' },
    { id: 'nandail', name: 'Nandail' },
    { id: 'phulpur', name: 'Phulpur' },
    { id: 'trishal', name: 'Trishal' }
  ],
  jamalpur: [
    { id: 'jamalpur-sadar', name: 'Jamalpur Sadar' },
    { id: 'bakshiganj', name: 'Bakshiganj' },
    { id: 'dewanganj', name: 'Dewanganj' },
    { id: 'islampur', name: 'Islampur' },
    { id: 'jamalpur-sadar', name: 'Jamalpur Sadar' },
    { id: 'madarganj', name: 'Madarganj' },
    { id: 'melandaha', name: 'Melandaha' },
    { id: 'sarishabari', name: 'Sarishabari' }
  ],
  netrokona: [
    { id: 'netrokona-sadar', name: 'Netrokona Sadar' },
    { id: 'atpara', name: 'Atpara' },
    { id: 'barhatta', name: 'Barhatta' },
    { id: 'durgapur', name: 'Durgapur' },
    { id: 'kalmakanda', name: 'Kalmakanda' },
    { id: 'kendua', name: 'Kendua' },
    { id: 'madan', name: 'Madan' },
    { id: 'khaliajuri', name: 'Khaliajuri' },
    { id: 'mohanganj', name: 'Mohanganj' },
    { id: 'netrokona-sadar', name: 'Netrokona Sadar' },
    { id: 'purbadhala', name: 'Purbadhala' }
  ],
  sherpur: [
    { id: 'sherpur-sadar', name: 'Sherpur Sadar' },
    { id: 'jhenaigati', name: 'Jhenaigati' },
    { id: 'nakla', name: 'Nakla' },
    { id: 'nalitabari', name: 'Nalitabari' },
    { id: 'sherpur-sadar', name: 'Sherpur Sadar' },
    { id: 'sreebardi', name: 'Sreebardi' }
  ]
};

// Helper function to get today's date in YYYY-MM-DD format (local timezone)
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// *** KEY FIX 1: Define the schema and type locally for the frontend ***
// This ensures the form and validation are perfectly in sync.
const registerSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  bloodGroup: z.string().min(1, "Blood group is required"),
  weight: z.number().min(50, "Weight must be at least 50kg"),
  division: z.string().min(1, "Division is required"),
  district: z.string().min(1, "District is required"),
  upazila: z.string().min(1, "Upazila is required"),
  address: z.string().min(1, "Address is required"),
  lastDonation: z.string().optional().refine((date) => {
    if (!date) return true; // Optional field, so if empty it's valid
    // Compare date strings directly to avoid timezone issues
    return date <= getTodayDateString();
  }, {
    message: "This date cannot be in the future",
  }),
  terms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  }),
  data_processing: z.boolean().refine(val => val === true, {
    message: "Consent for data processing is required"
  }),
  marketing: z.boolean().refine(val => val === true, {
    message: "Consent for marketing is required"
  }),
  emergency_contact: z.boolean().refine(val => val === true, {
    message: "Consent for emergency contact is required"
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Infer the type from our schema. This is the single source of truth for our form's data shape.
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [donorId, setdonorId] = useState('');
  
  // State for hierarchical dropdowns
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [availableDistricts, setAvailableDistricts] = useState<{ id: string; name: string }[]>([]);
  const [availableUpazilas, setAvailableUpazilas] = useState<{ id: string; name: string }[]>([]);

  // *** KEY FIX 2: Explicitly type the form with our RegisterFormValues ***
  // This resolves all the "Control is not assignable" errors.
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      dateOfBirth: '',
      gender: '',
      bloodGroup: '',
      weight: undefined, // *** KEY FIX 3: Use undefined for number inputs to avoid type errors ***
      division: '',
      district: '',
      upazila: '',
      address: '',
      lastDonation: '',
      terms: false,
      data_processing: false,
      marketing: false,
      emergency_contact: false,
    },
  });

  // Update districts when division changes
  useEffect(() => {
    if (selectedDivision) {
      const districts = districtsByDivision[selectedDivision] || [];
      setAvailableDistricts(districts);
      // Reset district and upazila when division changes
      form.setValue('district', '');
      form.setValue('upazila', '');
      setSelectedDistrict('');
      setAvailableUpazilas([]);
    } else {
      setAvailableDistricts([]);
      setAvailableUpazilas([]);
    }
  }, [selectedDivision, form]);

  // Update upazilas when district changes
  useEffect(() => {
    if (selectedDistrict) {
      const upazilas = upazilasByDistrict[selectedDistrict] || [];
      setAvailableUpazilas(upazilas);
      // Reset upazila when district changes
      form.setValue('upazila', '');
    } else {
      setAvailableUpazilas([]);
    }
  }, [selectedDistrict, form]);

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormValues) => {
      console.log("Data being sent to API:", JSON.stringify(data, null, 2));
      return apiRequest('/api/auth/register', { method: 'POST', body: data });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      setdonorId(data.donorId);
      setShowSuccessModal(true);
      toast({
        title: "Registration Successful!",
        description: "Your donor account has been created successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Registration failed:", error);
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong during registration",
        variant: "destructive",
      });
    },
  });

  // *** KEY FIX 4: Explicitly type the onSubmit function ***
  // This resolves the "SubmitHandler is not assignable" error.
  const onSubmit = (data: RegisterFormValues) => {
    console.log("Form submitted with data:", JSON.stringify(data, null, 2));
    registerMutation.mutate(data);
  };

 const watchedFields = form.watch();
  
  // Real-time validation checks - start as ineligible
  const eligibilityChecks = {
    age: watchedFields.dateOfBirth ? 
      (() => {
        const birth = new Date(watchedFields.dateOfBirth);
        const today = new Date();
        const birthYear = birth.getFullYear();
        const currentYear = today.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        const calculatedAge = currentYear - birthYear - (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate()) ? 1 : 0);
        return calculatedAge >= 18 && calculatedAge <= 65;
      })() : false,
    weight: watchedFields.weight ? watchedFields.weight >= 50 : false,
    lastDonation: watchedFields.lastDonation ? 
      (() => {
        // Check if it's been at least 120 days since last donation
        const lastDonation = new Date(watchedFields.lastDonation);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Check if the date is in the future
        if (lastDonation > today) {
          return false;
        }
        
        // Calculate days difference
        const diffTime = Math.abs(today.getTime() - lastDonation.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Return true only if it's been at least 120 days
        return diffDays >= 120;
      })() : true, // If no last donation date, assume eligible
    health: watchedFields.fullName && watchedFields.email && watchedFields.phone ? true : false,
  };

  const allEligible = Object.values(eligibilityChecks).every(Boolean);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              Become a Blood Donor
            </CardTitle>
            <p className="text-gray-600 mt-2">Join our community of life-savers</p>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username *</FormLabel>
                          <FormControl>
                            <Input placeholder="Choose a username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          {!eligibilityChecks.age && watchedFields.dateOfBirth && (
                            <p className="text-sm text-red-600">Must be at least 18 years old</p>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {genders.map((gender) => (
                                <SelectItem key={gender} value={gender}>
                                  {gender}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="+880 1XXXXXXXXX" {...field} />
                          </FormControl>
                          <p className="text-sm text-blue-600">OTP will be sent for verification</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password *</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password *</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Confirm password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Medical Information */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="bloodGroup"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Blood Group *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Blood Group" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {bloodGroups.map((group) => (
                                <SelectItem key={group} value={group}>
                                  {group}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (kg) *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="30" 
                              max="200"
                              placeholder="Minimum 50"
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                            />
                          </FormControl>
                          {!eligibilityChecks.weight && watchedFields.weight && watchedFields.weight > 0 && (
                            <p className="text-sm text-red-600">Must be at least 50kg</p>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastDonation"
                      render={({ field }) => {
                        // Check if the date is in the future by comparing date strings
                        const isFutureDate = field.value && field.value > getTodayDateString();
                        
                        return (
                          <FormItem>
                            <FormLabel>Last Donation (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                {...field} 
                                max={getTodayDateString()} 
                              />
                            </FormControl>
                            {isFutureDate && (
                              <p className="text-sm text-red-600">This date cannot be in the future</p>
                            )}
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>
                </div>

                {/* Address Information */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Address *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full address" {...field} />
                          </FormControl>
                          <p className="text-sm text-blue-600">Auto-suggestions powered by Google Maps</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="division"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Division *</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedDivision(value);
                              }} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Division" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {divisions.map((division) => (
                                  <SelectItem key={division.id} value={division.id}>
                                    {division.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="district"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>District *</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedDistrict(value);
                              }} 
                              defaultValue={field.value}
                              disabled={!selectedDivision}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select District" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {availableDistricts.map((district) => (
                                  <SelectItem key={district.id} value={district.id}>
                                    {district.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="upazila"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Upazila *</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              disabled={!selectedDistrict}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Upazila" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {availableUpazilas.map((upazila) => (
                                  <SelectItem key={upazila.id} value={upazila.id}>
                                    {upazila.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Eligibility Checker */}
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Eligibility Check
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Age ≥ 18 years</span>
                      {eligibilityChecks.age ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Weight ≥ 50kg</span>
                      {eligibilityChecks.weight ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Last donation ≥ 120 days ago</span>
                      {eligibilityChecks.lastDonation ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Health condition: Good</span>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  {allEligible && (
                    <Badge className="mt-3 bg-green-100 text-green-800">
                      ✓ Eligible to donate blood
                    </Badge>
                  )}
                  {!allEligible && (
                    <div className="mt-3 text-sm text-blue-700">
                      <AlertCircle className="w-4 h-4 inline mr-1" />
                      Note: You can still register even if not currently eligible to donate.
                    </div>
                  )}
                </div>

                {/* Terms and Submit */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Consents and Permissions</h3>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-3">
                      By creating an account, you consent to the following:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-2 mb-4">
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Processing of your personal data in accordance with our Privacy Policy</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Being contacted in case of emergency blood donation needs</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Receiving marketing communications about blood donation drives</span>
                      </li>
                    </ul>
                    
                    <FormField
                      control={form.control}
                      name="terms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                                // Set all consent fields when terms change
                                form.setValue("data_processing", checked as boolean);
                                form.setValue("marketing", checked as boolean);
                                form.setValue("emergency_contact", checked as boolean);
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-medium">
                              I consent to all of the above and agree to the <a href="/terms" className="text-primary hover:underline">Terms of Service</a> and <a href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</a> *
                            </FormLabel>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary text-white hover:bg-red-700"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    "Creating Account..."
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create Donor Account
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <div className="text-center mt-6">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link href="/login">
                  <Button variant="link" className="text-primary p-0 h-auto">
                    Sign In
                  </Button>
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Registration Successful!</DialogTitle>
            <DialogDescription className="text-center">
              Welcome to PulseCare! Your donor ID is:
            </DialogDescription>
          </DialogHeader>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-2xl font-bold text-primary">{donorId}</p>
            </div>
            <Button 
              onClick={() => {
                setShowSuccessModal(false);
                navigate('/login');
              }}
              className="w-full bg-primary text-white hover:bg-red-700"
            >
              Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}