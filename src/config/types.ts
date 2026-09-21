/** Fælles typer for både hjemmesiden og dashboardet. */

export type DayHours = { from: string; to: string } | null;

export type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  image: string;
  imageAlt: string;
  contactOnly?: boolean;
  /** Tillæg til et klip — kan ikke bookes alene. */
  addon?: boolean;
};

export type Vacation = {
  id: string;
  from: string;
  to: string;
  note: string;
};

export type EmployeeBase = {
  street: string;
  postalCode: string;
  city: string;
  lat: number;
  lon: number;
};

export type EmployeeGender = "male" | "female";

export type EmployeeReview = {
  quote: string;
  name: string;
  area?: string;
};

export type Employee = {
  id: string;
  name: string;
  role: string;
  /** Foto vist i booking-valget. */
  image: string;
  imageAlt: string;
  /** Hvor frisøren kører ud fra — bruges til kørselspris og kort. */
  base: EmployeeBase;
  /** false = skjult i booking, men stadig synlig i dashboard. */
  active: boolean;
  gender?: EmployeeGender;
  /** Behandlinger personen tilbyder. Tom = alle bookbare. */
  serviceIds?: string[];
  /** Kun udfyldt når der er rigtige anmeldelser — opfind ikke tal. */
  rating?: { average: number; count: number };
  reviews?: EmployeeReview[];
  bio?: string;
  qualifications?: string[];
  exampleImages?: string[];
};

export type Travel = {
  freeRadiusKm: number;
  zones: { maxKm: number; fee: number; label: string }[];
  maxServiceRadiusKm: number;
  minOrderValueLongDistance: number;
  longDistanceThresholdKm: number;
};

export type AppConfig = {
  name: string;
  tagline: string;
  ownerName: string;
  yearsOfExperience: number;
  phone: string;
  email: string;
  mobilePay: string;
  cvr: string;
  home: {
    street: string;
    postalCode: string;
    city: string;
    country: string;
    lat: number;
    lon: number;
  };
  openingHours: Record<number, DayHours>;
  bufferMinutes: number;
  minNoticeHours: number;
  maxAdvanceDays: number;
  /** Gratis afbud hvis mindst så mange timer før start. */
  cancelFreeHours: number;
  /** Gebyr i kr. ved afbud senere end cancelFreeHours. */
  lateCancelFeeKr: number;
  blockedDates: string[];
  vacations: Vacation[];
  employees: Employee[];
  travel: Travel;
  services: Service[];
  testimonials: { quote: string; name: string; area: string }[];
  areas: { slug: string; name: string; postalCodes: string[] }[];
  siteUrl: string;
};
