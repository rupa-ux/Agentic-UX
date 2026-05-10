import type { ReviewPlatformSite } from "@/app/components/reviewPlatformLogos";

type ReviewSentiment = "positive" | "neutral" | "negative";
type ReviewWorkflow = "none" | "agent_draft_pending_approval" | "reply_rejected" | "responded";

export type AdditionalReview = {
  id: number;
  site: ReviewPlatformSite;
  rating: number;
  reviewer: string;
  date: string;
  photoCount?: number;
  featured?: boolean;
  employees: number;
  location: string;
  photos: string[];
  text: string;
  replyStatus: "post" | "edit";
  hasReplyDots?: boolean;
  sentiment: ReviewSentiment;
  responseWorkflow: ReviewWorkflow;
  suggestedReply?: string;
  existingReply?: { text: string; author: string; date: string; platform: string };
  hasConversation?: boolean;
  priorityOrder?: number;
};

const img1 = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&auto=format";
const img2 = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop&auto=format";
const img3 = "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop&auto=format";
const img4 = "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=300&fit=crop&auto=format";
const img5 = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop&auto=format";
const img6 = "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&auto=format";
const img7 = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop&auto=format";

const photos = [
  [img1, img2, img3],
  [img4, img5],
  [img6, img7, img1],
  [img2, img5, img7],
  [img3, img4],
  [img1, img6],
];

const reviewInputs = [
  {
    rating: 1,
    reviewer: "Maya Holloway",
    site: "google",
    location: "Illinois",
    date: "Jan 5, 2025",
    text: "The reservation was lost, the host seemed confused, and we waited in the doorway for half an hour with no clear update. When we finally sat down, two entrees arrived cold and nobody checked back until we were ready to leave.",
  },
  {
    rating: 2,
    reviewer: "Owen Patel",
    site: "yelp",
    location: "Arizona",
    date: "Jan 11, 2025",
    text: "The appetizers were decent, but our server disappeared for long stretches and the check had items from another table. It was not a disaster, but it felt disorganized enough that I would choose somewhere else next time.",
  },
  {
    rating: 3,
    reviewer: "Nora Kim",
    site: "facebook",
    location: "Nevada",
    date: "Jan 16, 2025",
    text: "The meal was perfectly average. The dining room is comfortable and the staff were polite, but the pasta needed more seasoning and the dessert tasted like it had been refrigerated too long.",
  },
  {
    rating: 4,
    reviewer: "Luis Romero",
    site: "tripadvisor",
    location: "Colorado",
    date: "Jan 20, 2025",
    text: "Great lunch service with quick seating, fresh salads, and a server who knew the menu well. I took one star off because the espresso machine was down and the replacement coffee was weak.",
  },
  {
    rating: 5,
    reviewer: "Aisha Grant",
    site: "google",
    location: "Washington",
    date: "Jan 24, 2025",
    text: "Wonderful dinner from start to finish. The salmon was crisp outside and tender inside, the vegetables were bright, and the team handled our birthday cake with care.",
  },
  {
    rating: 1,
    reviewer: "Ethan Brooks",
    site: "facebook",
    location: "Michigan",
    date: "Feb 2, 2025",
    text: "We ordered pickup and arrived at the promised time, but the food had not even been started. After another twenty minutes, one bag was still missing fries and the soup lid leaked in the car.",
  },
  {
    rating: 2,
    reviewer: "Sofia Mendez",
    site: "tripadvisor",
    location: "Oregon",
    date: "Feb 7, 2025",
    text: "Beautiful space, but the experience did not match the setting. The steak was overcooked, the replacement took too long, and the manager seemed more interested in explaining than fixing it.",
  },
  {
    rating: 3,
    reviewer: "Caleb Wright",
    site: "google",
    location: "North Carolina",
    date: "Feb 12, 2025",
    text: "I liked the soup and bread, but the main course was forgettable. Service was friendly and the room was clean, so I might return for lunch rather than dinner.",
  },
  {
    rating: 4,
    reviewer: "Mei Tan",
    site: "yelp",
    location: "Massachusetts",
    date: "Feb 18, 2025",
    text: "The tasting menu was creative and mostly excellent. One course leaned too salty for me, but the rest of the meal had clear technique and thoughtful pacing.",
  },
  {
    rating: 5,
    reviewer: "Graham Ellis",
    site: "facebook",
    location: "Virginia",
    date: "Feb 23, 2025",
    text: "Our server helped us build a vegetarian family-style meal that everyone loved. Portions were generous, leftovers were packed neatly, and the whole table left happy.",
  },
  {
    rating: 1,
    reviewer: "Tara Singh",
    site: "tripadvisor",
    location: "Ohio",
    date: "Mar 1, 2025",
    text: "The restroom was dirty, the booth seat was sticky, and the table smelled like it had been wiped with an old towel. We left after appetizers because cleanliness felt questionable.",
  },
  {
    rating: 2,
    reviewer: "Blake Norton",
    site: "google",
    location: "Tennessee",
    date: "Mar 6, 2025",
    text: "The burger was fine, but the fries were limp and the shake arrived melted. For the price, I expected more consistency and better attention to simple details.",
  },
  {
    rating: 3,
    reviewer: "Ivy Morgan",
    site: "yelp",
    location: "Minnesota",
    date: "Mar 10, 2025",
    text: "Nothing was wrong exactly, but nothing stood out either. The staff were kind, the menu was safe, and the food did the job for a quick meal.",
  },
  {
    rating: 4,
    reviewer: "Andre Coleman",
    site: "facebook",
    location: "Pennsylvania",
    date: "Mar 15, 2025",
    text: "Good happy hour value and the sliders were better than expected. It got loud once the bar filled up, so I would not pick it for a quiet conversation.",
  },
  {
    rating: 5,
    reviewer: "Lena Fischer",
    site: "tripadvisor",
    location: "Utah",
    date: "Mar 21, 2025",
    text: "The mountain view patio was gorgeous, but the real surprise was how polished the service felt. Every plate arrived hot, and the berry tart was memorable.",
  },
  {
    rating: 1,
    reviewer: "Marcus Hale",
    site: "yelp",
    location: "Missouri",
    date: "Mar 27, 2025",
    text: "The delivery driver brought someone else's order and the restaurant told me to dispute it through the app. No one took ownership, and dinner was ruined.",
  },
  {
    rating: 2,
    reviewer: "Keira Olson",
    site: "facebook",
    location: "Indiana",
    date: "Apr 2, 2025",
    text: "The host was welcoming, but the kitchen missed two allergy notes that were repeated at ordering. We caught the problem before eating, yet it made the rest of the visit stressful.",
  },
  {
    rating: 3,
    reviewer: "Noah Bennett",
    site: "tripadvisor",
    location: "Maryland",
    date: "Apr 8, 2025",
    text: "Brunch had highs and lows. Pancakes were fluffy and coffee refills were fast, but the egg dishes came out lukewarm and the fruit cup was mostly melon.",
  },
  {
    rating: 4,
    reviewer: "Zara Williams",
    site: "google",
    location: "Wisconsin",
    date: "Apr 13, 2025",
    text: "Very reliable neighborhood dinner spot. The roast chicken was juicy, the salad was crisp, and the server suggested a great nonalcoholic spritz.",
  },
  {
    rating: 5,
    reviewer: "Felix Turner",
    site: "yelp",
    location: "Louisiana",
    date: "Apr 18, 2025",
    text: "The gumbo special tasted like someone cared about every layer of flavor. Staff were proud of the dish and explained the spice level honestly.",
  },
  {
    rating: 1,
    reviewer: "Holly Chen",
    site: "google",
    location: "New Jersey",
    date: "Apr 24, 2025",
    text: "I was charged twice for the same online order and still have not received a refund after three calls. The food was okay, but billing support has been awful.",
  },
  {
    rating: 2,
    reviewer: "Victor Alvarez",
    site: "tripadvisor",
    location: "Connecticut",
    date: "Apr 29, 2025",
    text: "The dining room looked elegant, but the prix fixe meal felt rushed and portions were tiny. We left hungry, which should not happen at this price.",
  },
  {
    rating: 3,
    reviewer: "Paige Russell",
    site: "facebook",
    location: "Kentucky",
    date: "May 4, 2025",
    text: "The patio is nice and the staff smiled often. Food quality was mixed: excellent corn salad, dry chicken, and a dessert that tasted better than it looked.",
  },
  {
    rating: 4,
    reviewer: "Dante Reed",
    site: "google",
    location: "Alabama",
    date: "May 9, 2025",
    text: "The lunch counter moved quickly and the cashier was patient with my questions. The only miss was a side dish that tasted underseasoned.",
  },
  {
    rating: 5,
    reviewer: "Mina Kapoor",
    site: "yelp",
    location: "South Carolina",
    date: "May 15, 2025",
    text: "We came in with a group of eight and the team handled everything gracefully. Shared plates were timed well, drinks stayed full, and the bill split was painless.",
  },
  {
    rating: 1,
    reviewer: "Jonah Price",
    site: "facebook",
    location: "Oklahoma",
    date: "May 20, 2025",
    text: "The chicken was raw near the bone and the replacement plate took so long that everyone else had finished eating. I expected a stronger apology.",
  },
  {
    rating: 2,
    reviewer: "Sienna Clarke",
    site: "google",
    location: "Iowa",
    date: "May 26, 2025",
    text: "Service was slow even though only a few tables were occupied. The pasta sauce was pleasant, but the noodles were clumped together and unevenly cooked.",
  },
  {
    rating: 3,
    reviewer: "Malik Foster",
    site: "yelp",
    location: "Kansas",
    date: "Jun 1, 2025",
    text: "The barbecue platter had good smoke, but the sides felt like an afterthought. I would order meat to go, but probably skip a full sit-down meal.",
  },
  {
    rating: 4,
    reviewer: "Clara Hughes",
    site: "tripadvisor",
    location: "Maine",
    date: "Jun 6, 2025",
    text: "Fresh seafood, kind staff, and a relaxed waterfront setting. The chowder was excellent, though the lobster roll could have used a little more lemon.",
  },
  {
    rating: 5,
    reviewer: "Rohan Mehta",
    site: "facebook",
    location: "New Mexico",
    date: "Jun 12, 2025",
    text: "Fantastic spice balance across the whole meal. The server guided us toward dishes we would never have chosen alone, and every recommendation landed.",
  },
  {
    rating: 1,
    reviewer: "Ellis Stone",
    site: "tripadvisor",
    location: "Nebraska",
    date: "Jun 18, 2025",
    text: "Our table was forgotten after seating. After twenty-five minutes with no drinks and no apology, we walked out and ate next door.",
  },
  {
    rating: 2,
    reviewer: "Jasmine Park",
    site: "yelp",
    location: "Rhode Island",
    date: "Jun 23, 2025",
    text: "The menu reads beautifully, but the execution was uneven. One dish was excellent, one was bland, and one was so salty we could not finish it.",
  },
  {
    rating: 3,
    reviewer: "Peter Lang",
    site: "google",
    location: "Idaho",
    date: "Jun 29, 2025",
    text: "A fair stop during a road trip. Sandwiches were fresh, bathrooms were clean, and service was quick, but the prices felt a bit high for counter service.",
  },
  {
    rating: 4,
    reviewer: "Olivia Hart",
    site: "facebook",
    location: "Delaware",
    date: "Jul 3, 2025",
    text: "The seasonal vegetable plate was colorful and satisfying. I appreciated that the kitchen treated vegetarian food as a real entree, not a compromise.",
  },
  {
    rating: 5,
    reviewer: "Mateo Cruz",
    site: "tripadvisor",
    location: "Montana",
    date: "Jul 9, 2025",
    text: "One of the best travel meals we had all summer. The steak was cooked exactly medium rare, and the server remembered our kids' names by dessert.",
  },
  {
    rating: 1,
    reviewer: "Ruth Adams",
    site: "google",
    location: "Arkansas",
    date: "Jul 14, 2025",
    text: "The catering order arrived forty minutes late and several trays were mislabeled. Guests with dietary restrictions had to guess, which is unacceptable.",
  },
  {
    rating: 2,
    reviewer: "Simon Bell",
    site: "facebook",
    location: "Mississippi",
    date: "Jul 20, 2025",
    text: "The staff were friendly, but the food tasted tired. Fries were cold, the bun was stale, and the sauce cups were missing from the bag.",
  },
  {
    rating: 3,
    reviewer: "Grace Lin",
    site: "tripadvisor",
    location: "New Hampshire",
    date: "Jul 25, 2025",
    text: "The breakfast buffet had plenty of choice, but several trays were empty for too long. The omelet station was the highlight and saved the visit.",
  },
  {
    rating: 4,
    reviewer: "Harper Quinn",
    site: "yelp",
    location: "West Virginia",
    date: "Aug 1, 2025",
    text: "Cozy dining room, thoughtful wine list, and a dessert menu that deserves attention. The entrees were strong, though the bread service arrived late.",
  },
  {
    rating: 5,
    reviewer: "Diego Morales",
    site: "google",
    location: "Hawaii",
    date: "Aug 6, 2025",
    text: "Fresh fish, beautiful plating, and service that felt genuinely warm. The team helped us celebrate a graduation and made the evening feel special.",
  },
  {
    rating: 1,
    reviewer: "Anika Shah",
    site: "yelp",
    location: "Vermont",
    date: "Aug 12, 2025",
    text: "The online menu listed vegan options that were unavailable when we arrived. Staff seemed annoyed by questions, and my final plate was plain rice and vegetables.",
  },
  {
    rating: 2,
    reviewer: "Miles Carter",
    site: "tripadvisor",
    location: "Alaska",
    date: "Aug 17, 2025",
    text: "The view is excellent, but service was chaotic and the fish tacos were soggy. I wanted to love it, but the basics need work.",
  },
  {
    rating: 3,
    reviewer: "Celeste Young",
    site: "facebook",
    location: "Wyoming",
    date: "Aug 23, 2025",
    text: "Decent meal overall. The staff handled a busy night well, but the menu could use more lighter options and the salad dressing was too sweet.",
  },
  {
    rating: 4,
    reviewer: "Theo Martin",
    site: "google",
    location: "North Dakota",
    date: "Aug 29, 2025",
    text: "Clean restaurant, quick service, and a surprisingly good kids' menu. The mac and cheese was a little bland, but everything else was solid.",
  },
];

function sentimentForRating(rating: number): ReviewSentiment {
  if (rating <= 2) return "negative";
  if (rating === 3) return "neutral";
  return "positive";
}

function workflowForRating(rating: number, index: number): ReviewWorkflow {
  if (rating <= 2) return index % 3 === 0 ? "reply_rejected" : "none";
  if (rating === 3) return index % 2 === 0 ? "agent_draft_pending_approval" : "responded";
  return index % 5 === 0 ? "agent_draft_pending_approval" : "responded";
}

function suggestedReplyFor(rating: number, reviewer: string): string {
  if (rating <= 2) {
    return `We're sorry we missed the mark, ${reviewer}. Thank you for sharing the details so our team can follow up and improve.`;
  }
  if (rating === 3) {
    return `Thank you for the balanced feedback, ${reviewer}. We appreciate the specifics and will use them to improve the experience.`;
  }
  return `Thank you for the kind words, ${reviewer}! We're glad you enjoyed your visit and hope to welcome you back soon.`;
}

export const additionalMockReviews: AdditionalReview[] = reviewInputs.map((review, index) => {
  const isLeadNegative = index < 3;
  const sentiment = isLeadNegative ? "negative" : sentimentForRating(review.rating);
  const responseWorkflow: ReviewWorkflow = isLeadNegative
    ? (index === 0 ? "responded" : "agent_draft_pending_approval")
    : workflowForRating(review.rating, index);
  const replyStatus = responseWorkflow === "responded" || responseWorkflow === "reply_rejected" ? "edit" : "post";
  const siteLabel = review.site === "tripadvisor" ? "TripAdvisor" : review.site[0].toUpperCase() + review.site.slice(1);
  const leadDates = ["May 10, 2026, 10:05 AM", "May 10, 2026, 9:42 AM", "May 10, 2026, 9:18 AM"];
  const leadReplies = [
    "Hi Maya, thank you for letting us know. We're sorry your reservation and service experience fell short, especially after a long wait. We are reviewing this with our host and floor teams so we can communicate delays clearly and check on guests more consistently.",
    "Hi Owen, we're sorry the service felt disorganized and that your check was inaccurate. We've shared this with the team so we can tighten table follow-up and bill review before presenting checks.",
    "Hi Nora, thank you for the honest feedback. We're sorry the meal felt underwhelming, and we're using notes like yours to improve seasoning, dessert freshness, and overall consistency.",
  ];

  return {
    id: index + 17,
    ...review,
    date: isLeadNegative ? leadDates[index] : review.date,
    employees: (index % 3) + 1,
    photos: index === 0 ? [] : photos[index % photos.length],
    photoCount: index === 0 ? undefined : index % 4 === 0 ? (index % 8) + 4 : undefined,
    featured: review.rating === 5 && index % 4 === 0,
    replyStatus,
    hasReplyDots: index % 6 === 0,
    sentiment,
    responseWorkflow,
    suggestedReply: replyStatus === "post" ? (isLeadNegative ? leadReplies[index] : suggestedReplyFor(review.rating, review.reviewer)) : undefined,
    existingReply: replyStatus === "edit"
      ? {
          text: isLeadNegative ? leadReplies[index] : suggestedReplyFor(review.rating, review.reviewer),
          author: responseWorkflow === "reply_rejected" ? "Manager" : "Sampada (me)",
          date: isLeadNegative ? leadDates[index] : "Sep 1, 2025",
          platform: siteLabel,
        }
      : undefined,
    hasConversation: index % 4 === 0,
    priorityOrder: isLeadNegative ? index : undefined,
  };
});

export function sortReviewsByRecency<T extends { date: string }>(reviews: T[]): T[] {
  return [...reviews].sort((a, b) => {
    const aPriority = typeof (a as { priorityOrder?: number }).priorityOrder === "number"
      ? (a as { priorityOrder: number }).priorityOrder
      : Number.POSITIVE_INFINITY;
    const bPriority = typeof (b as { priorityOrder?: number }).priorityOrder === "number"
      ? (b as { priorityOrder: number }).priorityOrder
      : Number.POSITIVE_INFINITY;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}
