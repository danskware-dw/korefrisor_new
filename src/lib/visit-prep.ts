export const visitPrepChecklist = [
  "En stol med plads til at gå rundt (kørestol er fint)",
  "Håret må gerne være tørt, medmindre du selv har vasket det",
  "Et stykke gulv, der er ryddet, så kappen og tæppet kan ligge",
  "Frisøren har sakse, maskine, kappe, gulvtæppe og spejl med",
  "Jeg fejer op og tager håret med — der skal ikke støvsuges",
];

export function visitPrepPlainList(): string {
  return visitPrepChecklist.map((item) => `• ${item}`).join("\n");
}
