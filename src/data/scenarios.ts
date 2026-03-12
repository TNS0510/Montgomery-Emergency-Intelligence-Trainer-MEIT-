import { Scenario, ResponseCategory } from '../types';

export const SCENARIOS: Scenario[] = [
  {
    id: 1,
    location: {
      name: "Dexter Avenue Baptist Church",
      lat: 32.377294,
      lng: -86.302780
    },
    category: "MEDICAL",
    incident: "A person collapses during a tour and is not responding. Breathing is shallow.",
    correctResponse: ResponseCategory.MEDICAL,
    reason: "Possible cardiac arrest or respiratory failure requiring immediate life-saving intervention.",
    impact: "Fast response saved a life. Dispatcher efficiency maintained.",
    severity: 10
  },
  {
    id: 2,
    location: {
      name: "Maxwell Air Force Base (Gate 4)",
      lat: 32.379170,
      lng: -86.362500
    },
    category: "TRAFFIC",
    incident: "Minor fender bender between two cars. No injuries, but drivers are arguing loudly.",
    correctResponse: ResponseCategory.POLICE,
    reason: "Property damage only with no immediate threat to life. Should be handled via standard police report.",
    impact: "Correct classification prevented unnecessary siren-response, keeping units available for real emergencies.",
    severity: 4
  },
  {
    id: 3,
    location: {
      name: "Riverwalk Stadium",
      lat: 32.382200,
      lng: -86.310600
    },
    category: "CIVIL",
    incident: "A fan is upset because their ticket won't scan and the gate agent is refusing entry.",
    correctResponse: ResponseCategory.LOW_PRIORITY,
    reason: "This is a civil/business dispute. City services or stadium security should handle this, not 911.",
    impact: "Redirecting saved 911 line capacity for actual distress calls.",
    severity: 2
  },
  {
    id: 4,
    location: {
      name: "Alabama State University",
      lat: 32.364000,
      lng: -86.295000
    },
    category: "MEDICAL",
    incident: "Student found unconscious in the library. Unknown cause.",
    correctResponse: ResponseCategory.MEDICAL,
    reason: "Unconscious individuals are high-priority medical emergencies until cleared by EMTs.",
    impact: "Rapid dispatch ensured medical team arrived within the golden hour.",
    severity: 9
  },
  {
    id: 5,
    location: {
      name: "Cloverdale Road",
      lat: 32.359600,
      lng: -86.279000
    },
    category: "NOISE",
    incident: "Large house party with loud music and people spilling into the street at 2 AM.",
    correctResponse: ResponseCategory.POLICE,
    reason: "Noise complaint. While it requires police presence, it is not a life-safety emergency.",
    impact: "Properly queued as low-priority, allowing officers to prioritize a nearby domestic call.",
    severity: 3
  },
  {
    id: 6,
    location: {
      name: "Court St / Dexter Ave",
      lat: 32.377220,
      lng: -86.309170
    },
    category: "UTILITY",
    incident: "Large water main break. Water is flooding the intersection but no cars are trapped.",
    correctResponse: ResponseCategory.LOW_PRIORITY,
    reason: "Public Works/Water Department issue. 911 dispatch should redirect to utility services.",
    impact: "Prevented clogging the police radio with non-criminal utility issues.",
    severity: 5
  }
];
