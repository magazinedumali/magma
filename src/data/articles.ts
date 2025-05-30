export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  date: string;
  author: string;
  featured?: boolean;
  audio?: string;
  tags?: string[];
  slug?: string;
}

export const articles: Article[] = [
  {
    id: '1',
    title: 'Global Climate Conference Reaches Historic Agreement on Emissions',
    excerpt: 'World leaders have reached a landmark agreement to reduce carbon emissions by 50% by 2030, signaling a major step forward in the fight against climate change.',
    content: `
      <p class="mb-4">
        In a historic moment for global climate action, world leaders have unanimously agreed to implement unprecedented measures to combat climate change. The agreement, reached after intense negotiations, sets ambitious targets for reducing carbon emissions across all major economies.
      </p>

      <h2 class="text-2xl font-bold mt-8 mb-4">Points clés de l'accord</h2>
      
      <p class="mb-4">
        Les principaux points de l'accord incluent :
      </p>
      
      <ul class="list-disc pl-6 mb-4">
        <li>Réduction de 50% des émissions de carbone d'ici 2030</li>
        <li>Investissement de 100 milliards de dollars dans les énergies renouvelables</li>
        <li>Création d'un fonds d'aide aux pays en développement</li>
        <li>Mise en place d'un système de surveillance international</li>
      </ul>

      <h2 class="text-2xl font-bold mt-8 mb-4">Analyse d'expert</h2>
      
      <p class="mb-4">
        Dr. Sarah Chen, climatologue de renommée mondiale, souligne l'importance de cet accord :
      </p>
      
      <blockquote class="border-l-4 border-news-red pl-4 italic my-6">
        "Cet accord représente une avancée majeure dans notre lutte contre le changement climatique. Les objectifs fixés sont ambitieux mais réalisables, et le soutien financier promis aux pays en développement est crucial pour assurer une transition équitable vers une économie bas-carbone."
      </blockquote>

      <h2 class="text-2xl font-bold mt-8 mb-4">Impact sur l'économie</h2>
      
      <p class="mb-4">
        Les experts économiques prévoient que cet accord stimulera l'innovation et créera des millions d'emplois dans le secteur des énergies renouvelables. Les investissements massifs dans les technologies vertes devraient également accélérer la transition énergétique mondiale.
      </p>

      <h2 class="text-2xl font-bold mt-8 mb-4">Prochaines étapes</h2>
      
      <p class="mb-4">
        Les pays signataires devront maintenant :
      </p>
      
      <ul class="list-disc pl-6 mb-4">
        <li>Élaborer des plans nationaux détaillés</li>
        <li>Mettre en place les mécanismes de financement</li>
        <li>Développer les infrastructures nécessaires</li>
        <li>Former la main-d'œuvre aux nouvelles technologies</li>
      </ul>

      <p class="mb-4">
        La prochaine conférence de suivi est prévue dans six mois pour évaluer les progrès et ajuster les objectifs si nécessaire.
      </p>
    `,
    image: 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb',
    category: 'Environment',
    date: 'May 12, 2025',
    author: 'Emma Johnson',
    featured: true,
    tags: ['climate', 'agreement', 'emissions', 'environment', 'summit', 'unitedNations']
  },
  {
    id: '2',
    title: 'Tech Giants Announce Breakthrough in Quantum Computing Technology',
    excerpt: 'Major technology companies unveiled a revolutionary quantum processor capable of solving complex problems in seconds that would take traditional supercomputers thousands of years.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi.',
    image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b',
    category: 'Technology',
    date: 'May 11, 2025',
    author: 'Daniel Lee',
    featured: true
  },
  {
    id: '3',
    title: 'Major Economic Powers Agree on New Trade Framework',
    excerpt: 'G20 nations have established a groundbreaking trade agreement aimed at reducing tariffs and promoting sustainable economic growth across global markets.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi.',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
    category: 'Business',
    date: 'May 10, 2025',
    author: 'Sophia Chen',
    featured: true
  },
  {
    id: '4',
    title: 'Archaeologists Discover Ancient City Hidden in Amazon Rainforest',
    excerpt: 'Using advanced LiDAR technology, researchers have uncovered the remains of a vast urban settlement dating back over 2,000 years in the heart of the Amazon.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi.',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
    category: 'Science',
    date: 'May 9, 2025',
    author: 'James Wilson',
    featured: false
  },
  {
    id: '5',
    title: 'Revolutionary New Drug Shows Promise in Cancer Treatment Trials',
    excerpt: 'Clinical trials for a novel immunotherapy drug have demonstrated unprecedented success rates in treating advanced stages of multiple cancer types.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    category: 'Health',
    date: 'May 8, 2025',
    author: 'Olivia Martinez',
    featured: false
  },
  {
    id: '6',
    title: 'National Basketball Association Announces Expansion to New Global Markets',
    excerpt: 'The NBA has unveiled plans to establish professional teams in Europe and Asia as part of its strategy to grow the sport internationally.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi.',
    image: 'https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a',
    category: 'Sports',
    date: 'May 7, 2025',
    author: 'Michael Brown',
    featured: false
  },
  {
    id: '7',
    title: 'Award-Winning Director Announces Revolutionary Film Project',
    excerpt: 'The Oscar-winning filmmaker has revealed details about an upcoming project that will combine virtual reality and traditional cinema in an unprecedented way.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi.',
    image: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625',
    category: 'Entertainment',
    date: 'May 6, 2025',
    author: 'Sarah Davis',
    featured: false
  },
  {
    id: '8',
    title: 'Major Political Parties Reach Agreement on Electoral Reform',
    excerpt: 'In a rare show of bipartisanship, lawmakers have agreed on a comprehensive package of electoral reforms aimed at increasing transparency and voter participation.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi.',
    image: 'https://images.unsplash.com/photo-1494891848038-7bd202a2afeb',
    category: 'Politics',
    date: 'May 5, 2025',
    author: 'Robert Thompson',
    featured: false
  },
  {
    id: '9',
    title: 'Global Stock Markets Reach Record Highs Amid Economic Optimism',
    excerpt: 'Major indices around the world have surged to unprecedented levels following positive economic indicators and strong corporate earnings reports.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi.',
    image: 'https://images.unsplash.com/photo-1551038247-3d9af20df552',
    category: 'Business',
    date: 'May 4, 2025',
    author: 'Jessica Wong',
    featured: false
  },
  {
    id: '10',
    title: 'Scientists Report Breakthrough in Renewable Energy Storage',
    excerpt: 'A team of researchers has developed a new battery technology that could revolutionize how we store and use renewable energy on a large scale.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi.',
    image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901',
    category: 'Science',
    date: 'May 3, 2025',
    author: 'Thomas Miller',
    featured: false
  },
  {
    id: '11',
    title: 'Government Announces Major Infrastructure Investment Plan',
    excerpt: 'A comprehensive $2 trillion infrastructure package has been approved, focusing on transportation, renewable energy, and digital connectivity.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi.',
    image: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04',
    category: 'Politics',
    date: 'May 2, 2025',
    author: 'Anna Garcia',
    featured: false
  },
  {
    id: '12',
    title: 'Leading Smartphone Manufacturer Unveils Revolutionary Foldable Device',
    excerpt: 'The latest innovation in mobile technology features an expandable screen that can transform from phone to tablet size with advanced durability.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi.',
    image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7',
    category: 'Technology',
    date: 'May 1, 2025',
    author: 'William Jones',
    featured: false
  }
];

export const getArticlesByCategory = (category: string): Article[] => {
  return articles.filter(article => article.category.toLowerCase() === category.toLowerCase());
};

export const getFeaturedArticles = (): Article[] => {
  return articles.filter(article => article.featured);
};

export const getRecentArticles = (limit: number = 5): Article[] => {
  return [...articles].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  }).slice(0, limit);
};

export const getTrendingArticles = (limit: number = 5): Article[] => {
  // In a real app, this would be based on view counts or other metrics
  // For now, we'll just return some articles
  return articles.slice(3, 3 + limit);
};

export const getArticleById = (id: string): Article | undefined => {
  return articles.find(article => article.id === id);
};
