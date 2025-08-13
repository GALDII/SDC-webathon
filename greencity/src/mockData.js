export const mockData = {
  events: [
    { id: 1, title: 'Community Tree Plantation Drive', date: '2025-09-15', description: 'Join us to plant over 200 saplings near the city lake. All tools provided.', participants: 45, limit: 100, feedback: [] },
    { id: 2, title: 'Urban Cleanup Campaign', date: '2025-09-22', description: 'A city-wide initiative to clean our streets and parks. Gloves and bags will be distributed.', participants: 112, limit: 200, feedback: [] },
    { id: 3, title: 'Recycling & Composting Workshop', date: '2025-10-05', description: 'Learn effective techniques for home recycling and composting from sustainability experts.', participants: 18, limit: 50, feedback: [] },
  ],
  businesses: [
    { id: 1, name: 'Organic Harvest Foods', category: 'Organic Food', rating: 4.8, description: 'Your one-stop shop for fresh, locally-sourced organic produce and groceries.' },
    { id: 2, name: 'Solaris Renewable Energy', category: 'Renewable Energy', rating: 4.9, description: 'Providing affordable solar panel installation for homes and businesses.' },
    { id: 3, name: 'EcoPack Solutions', category: 'Eco-friendly Packaging', rating: 4.6, description: 'Biodegradable and compostable packaging solutions for businesses of all sizes.' },
    { id: 4, name: 'GreenWheels E-Bikes', category: 'Transport', rating: 4.7, description: 'Rent or buy electric bikes for a clean and efficient commute.' },
  ],
  userActions: [
      { userId: 1, name: 'Priya Sharma', points: 250 },
      { userId: 2, name: 'Rohan Verma', points: 210 },
      { userId: 3, name: 'Aisha Khan', points: 180 },
      { userId: 4, name: 'David Lee', points: 155 },
  ],
  forumPosts: [
      { id: 1, board: 'transport', title: 'Improving Last-Mile Connectivity', author: 'Rohan V.', upvotes: 22, comments: 5 },
      { id: 2, board: 'energy', title: 'Idea: Community Solar Grids?', author: 'Priya S.', upvotes: 45, comments: 12 },
  ],
  recyclingCenters: [
    { id: 1, pos: [12.975, 77.600], name: 'Bengaluru Central Recycling', type: 'Recycling Center' },
    { id: 2, pos: [12.960, 77.585], name: 'Green Waste Solutions', type: 'Composting Facility' },
    { id: 3, pos: [12.985, 77.620], name: 'E-Waste Collection Point', type: 'Waste Collection Point' },
  ]
};
