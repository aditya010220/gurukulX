import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import ContextualModal from '../../components/ui/ContextualModal';
import NewExchangeModal from '../../components/NewExchangeModal';
import HeroWelcomeCard from './components/HeroWelcomeCard';
import OngoingExchangeCard from './components/OngoingExchangeCard';
import SmartMatchCard from './components/SmartMatchCard';
import AIAssistantBlock from './components/AIAssistantBlock';
import CommunityFeedCard from './components/CommunityFeedCard';
import MarketplacePreviewCard from './components/MarketplacePreviewCard';

import Button from '../../components/ui/Button';

const PersonalUserHub = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);
  const [userData, setUserData] = useState({
    name: "Alex Rivera",
    email: "alex.rivera@skillgarden.com",
    skillCoins: 1250,
    currentStreak: 12,
    totalExchanges: 24
  });

  useEffect(() => {
    // Load user data from Clerk
    if (user) {
      setUserData(prev => ({
        ...prev,
        name: user.fullName || user.firstName || prev.name,
        email: user.primaryEmailAddress?.emailAddress || prev.email
      }));
    }
  }, [user]);

  const handleProfileClick = async (action) => {
    if (action === 'logout') {
      // Sign out using Clerk
      await signOut();
      navigate('/auth');
    } else if (action === 'profile') {
      // Show profile modal
      setModalContent({
        type: 'user-profile',
        userName: userData?.name,
        userTitle: 'Full Stack Developer',
        location: 'San Francisco, CA',
        skills: ['React', 'Node.js', 'TypeScript', 'GraphQL'],
        learningGoals: ['UI Design', 'Motion Graphics', 'Figma'],
        skillCoins: userData?.skillCoins,
        exchangesCompleted: userData?.totalExchanges
      });
      setModalOpen(true);
    } else {
      console.log('Profile action:', action);
      // Handle other profile actions here
    }
  };

  const ongoingExchanges = [
  {
    id: 1,
    partnerName: "Sarah Chen",
    partnerAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1d92ac120-1763293804988.png",
    partnerAvatarAlt: "Professional headshot of Asian woman with long black hair wearing white blouse and warm smile",
    partnerTitle: "Full Stack Developer",
    teachingSkill: "React Development",
    learningSkill: "UI/UX Design",
    completedSessions: 6,
    totalSessions: 10,
    nextSession: "Feb 13, 2026 at 3:00 PM"
  },
  {
    id: 2,
    partnerName: "Michael Torres",
    partnerAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1c30629a8-1763296377538.png",
    partnerAvatarAlt: "Professional headshot of Hispanic man with short black hair in navy suit and confident expression",
    partnerTitle: "Product Designer",
    teachingSkill: "JavaScript Fundamentals",
    learningSkill: "Motion Graphics",
    completedSessions: 3,
    totalSessions: 8,
    nextSession: "Feb 14, 2026 at 10:00 AM"
  },
  {
    id: 3,
    partnerName: "Emma Wilson",
    partnerAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_117e4bd25-1763295402445.png",
    partnerAvatarAlt: "Professional headshot of Caucasian woman with blonde hair in gray blazer with friendly demeanor",
    partnerTitle: "Data Scientist",
    teachingSkill: "Web Development Basics",
    learningSkill: "Python for Data Analysis",
    completedSessions: 8,
    totalSessions: 10,
    nextSession: "Feb 15, 2026 at 2:00 PM"
  }];


  const smartMatches = [
  {
    id: 1,
    name: "David Kim",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1c4856e22-1763294353311.png",
    avatarAlt: "Professional headshot of Asian man with glasses wearing blue shirt and welcoming smile",
    title: "Mobile App Developer",
    compatibilityScore: 95,
    canTeach: ["Flutter", "React Native", "iOS Development", "Android Development"],
    wantsToLearn: ["React", "TypeScript", "Web Development"],
    location: "San Francisco, CA",
    rating: 4.9
  },
  {
    id: 2,
    name: "Lisa Anderson",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_149978121-1763293908052.png",
    avatarAlt: "Professional headshot of African American woman with curly hair in red top with bright smile",
    title: "UX Researcher",
    compatibilityScore: 92,
    canTeach: ["User Research", "Figma", "Design Thinking", "Prototyping"],
    wantsToLearn: ["JavaScript", "React", "Frontend Development"],
    location: "New York, NY",
    rating: 4.8
  },
  {
    id: 3,
    name: "James Martinez",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_13790d79a-1763295637209.png",
    avatarAlt: "Professional headshot of Hispanic man with beard wearing green shirt and professional demeanor",
    title: "DevOps Engineer",
    compatibilityScore: 88,
    canTeach: ["Docker", "Kubernetes", "AWS", "CI/CD"],
    wantsToLearn: ["React", "Node.js", "Full Stack Development"],
    location: "Austin, TX",
    rating: 4.7
  },
  {
    id: 4,
    name: "Priya Patel",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_192d20565-1763300854621.png",
    avatarAlt: "Professional headshot of Indian woman with long dark hair wearing purple blouse with confident expression",
    title: "Machine Learning Engineer",
    compatibilityScore: 85,
    canTeach: ["Python", "TensorFlow", "Machine Learning", "Data Science"],
    wantsToLearn: ["Web Development", "React", "JavaScript"],
    location: "Seattle, WA",
    rating: 4.9
  }];


  const aiTips = [
  {
    title: "Consistency is Key",
    content: "Studies show that practicing a skill for just 20 minutes daily leads to better retention than longer, sporadic sessions. Your 12-day streak is building strong neural pathways!"
  },
  {
    title: "Teach to Learn Better",
    content: "Teaching others reinforces your own understanding. Your ongoing exchanges aren\'t just helping others—they\'re making you a better learner too."
  },
  {
    title: "Diversify Your Skills",
    content: "Learning complementary skills creates powerful synergies. Consider pairing your React knowledge with UI/UX design for a complete skill set."
  },
  {
    title: "Set Micro-Goals",
    content: "Break down your learning objectives into small, achievable milestones. Each completed session brings you closer to mastery."
  },
  {
    title: "Embrace Mistakes",
    content: "Errors are learning opportunities. The most successful learners view mistakes as valuable feedback, not failures."
  }];


  const communityFeed = [
  {
    id: 1,
    authorName: "Emma Wilson",
    authorAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_117e4bd25-1763295402445.png",
    authorAvatarAlt: "Professional headshot of Caucasian woman with blonde hair in gray blazer with friendly demeanor",
    isVerified: true,
    timeAgo: "2 hours ago",
    content: "Just completed my 10th skill exchange! 🎉 Learning Python from David has been incredible. The peer-to-peer approach makes complex concepts so much easier to grasp.",
    achievement: "10 Exchanges Milestone",
    skillTags: ["Python", "DataScience", "PeerLearning"],
    likes: 42,
    comments: 8,
    isLiked: false
  },
  {
    id: 2,
    authorName: "Michael Torres",
    authorAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1c30629a8-1763296377538.png",
    authorAvatarAlt: "Professional headshot of Hispanic man with short black hair in navy suit and confident expression",
    isVerified: true,
    timeAgo: "5 hours ago",
    content: "Huge shoutout to Sarah for teaching me advanced React patterns! The component composition techniques we covered today were mind-blowing. Can\'t wait for our next session.",
    skillTags: ["React", "WebDevelopment", "JavaScript"],
    likes: 38,
    comments: 12,
    isLiked: true
  },
  {
    id: 3,
    authorName: "Lisa Anderson",
    authorAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_149978121-1763293908052.png",
    authorAvatarAlt: "Professional headshot of African American woman with curly hair in red top with bright smile",
    isVerified: false,
    timeAgo: "1 day ago",
    content: "New to SkillGarden and already loving the community! Just had my first exchange session learning Figma. The gamification makes learning so engaging. 🌱",
    achievement: "First Exchange Complete",
    skillTags: ["Figma", "UIDesign", "NewMember"],
    likes: 56,
    comments: 15,
    isLiked: false
  },
  {
    id: 4,
    authorName: "James Martinez",
    authorAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_13790d79a-1763295637209.png",
    authorAvatarAlt: "Professional headshot of Hispanic man with beard wearing green shirt and professional demeanor",
    isVerified: true,
    timeAgo: "1 day ago",
    content: "Reached 1500 SkillCoins today! 💰 The reward system really motivates consistent learning. Already planning my next skill exchange with Priya to learn Machine Learning basics.",
    skillTags: ["Milestone", "SkillCoins", "MachineLearning"],
    likes: 67,
    comments: 20,
    isLiked: true
  }];


  const marketplaceOfferings = [
  {
    id: 1,
    title: "Advanced React Patterns",
    coverImage: "https://images.unsplash.com/photo-1542546068979-b6affb46ea8f",
    coverImageAlt: "Modern workspace with laptop displaying colorful React code on screen with coffee cup and notebook",
    instructorName: "Sarah Chen",
    instructorAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1d92ac120-1763293804988.png",
    instructorAvatarAlt: "Professional headshot of Asian woman with long black hair wearing white blouse and warm smile",
    description: "Master advanced React patterns including compound components, render props, and custom hooks. Perfect for developers looking to level up their React skills.",
    duration: "8 weeks",
    students: 124,
    level: "Advanced",
    rating: 4.9,
    price: 450
  },
  {
    id: 2,
    title: "UI/UX Design Fundamentals",
    coverImage: "https://images.unsplash.com/photo-1675317120753-ce28b951e9e8",
    coverImageAlt: "Designer workspace with Figma interface open showing colorful UI mockups and design tools",
    instructorName: "Michael Torres",
    instructorAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1c30629a8-1763296377538.png",
    instructorAvatarAlt: "Professional headshot of Hispanic man with short black hair in navy suit and confident expression",
    description: "Learn the principles of user-centered design, from wireframing to prototyping. Includes hands-on projects and real-world case studies.",
    duration: "6 weeks",
    students: 89,
    level: "Beginner",
    rating: 4.8,
    price: 350
  },
  {
    id: 3,
    title: "Python for Data Science",
    coverImage: "https://img.rocket.new/generatedImages/rocket_gen_img_1273044c1-1766319477622.png",
    coverImageAlt: "Computer screen displaying Python code with data visualization graphs and pandas dataframes",
    instructorName: "Priya Patel",
    instructorAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_192d20565-1763300854621.png",
    instructorAvatarAlt: "Professional headshot of Indian woman with long dark hair wearing purple blouse with confident expression",
    description: "Comprehensive introduction to Python for data analysis, covering pandas, NumPy, and data visualization with real datasets.",
    duration: "10 weeks",
    students: 156,
    level: "Intermediate",
    rating: 4.9,
    price: 500
  },
  {
    id: 4,
    title: "Mobile App Development",
    coverImage: "https://images.unsplash.com/photo-1595846870485-df6f64d1e510",
    coverImageAlt: "Smartphone displaying mobile app interface with developer tools and code editor in background",
    instructorName: "David Kim",
    instructorAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1c4856e22-1763294353311.png",
    instructorAvatarAlt: "Professional headshot of Asian man with glasses wearing blue shirt and welcoming smile",
    description: "Build cross-platform mobile apps with React Native. Learn navigation, state management, and deployment to app stores.",
    duration: "12 weeks",
    students: 98,
    level: "Intermediate",
    rating: 4.7,
    price: 550
  }];


  const handleSidebarAction = (action) => {
    console.log('Sidebar action:', action);
    if (action?.action === 'new-exchange') {
      setExchangeModalOpen(true);
    }
  };

  const handleScheduleClick = (exchange) => {
    console.log('Schedule clicked:', exchange);
    setModalContent({
      type: 'exchange-request',
      title: 'Reschedule Session',
      description: `Reschedule your session with ${exchange?.partnerName}`,
      userSkill: exchange?.teachingSkill,
      targetSkill: exchange?.learningSkill
    });
    setModalOpen(true);
  };

  const handleViewDetails = (exchange) => {
    console.log('View details:', exchange);
  };

  const handleConnectClick = (match) => {
    console.log('Connect clicked:', match);
    setModalContent({
      type: 'user-profile',
      userName: match?.name,
      userTitle: match?.title,
      location: match?.location,
      skills: match?.canTeach,
      learningGoals: match?.wantsToLearn,
      skillCoins: 0,
      exchangesCompleted: 0
    });
    setModalOpen(true);
  };

  const handleAskQuestion = () => {
    console.log('Ask AI Assistant');
  };

  const handlePostLike = (post) => {
    console.log('Post liked:', post);
  };

  const handlePostComment = (post) => {
    console.log('Comment on post:', post);
    setModalContent({
      type: 'community-post',
      author: post?.authorName,
      authorTitle: post?.authorTitle || 'Community Member',
      postContent: post?.content,
      likes: post?.likes,
      comments: post?.comments,
      commentsList: [
      { author: 'John Doe', text: 'Great achievement!', time: '1 hour ago' },
      { author: 'Jane Smith', text: 'Inspiring progress!', time: '30 minutes ago' }]

    });
    setModalOpen(true);
  };

  const handlePostShare = (post) => {
    console.log('Share post:', post);
  };

  const handleBookClick = (offering) => {
    console.log('Book offering:', offering);
  };

  const handleViewProfile = (offering) => {
    console.log('View profile:', offering);
  };

  return (
    <div className="overflow-x-hidden">
          <div className="mb-6 md:mb-8 lg:mb-10">
            <HeroWelcomeCard
              userName={userData?.name}
              skillCoins={userData?.skillCoins}
              currentStreak={userData?.currentStreak}
              totalExchanges={userData?.totalExchanges} />
            
          </div>

          <section className="mb-8 md:mb-10 lg:mb-12">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-heading font-semibold text-foreground mb-2">
                  Ongoing Exchanges
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  Continue your learning journey with active skill exchanges
                </p>
              </div>
              <Button
                variant="outline"
                size="default"
                iconName="Plus"
                iconPosition="left"
                onClick={() => handleSidebarAction({ action: 'new-exchange' })}
                className="hidden sm:flex">
                
                New Exchange
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {ongoingExchanges?.map((exchange) =>
              <OngoingExchangeCard
                key={exchange?.id}
                exchange={exchange}
                onScheduleClick={handleScheduleClick}
                onViewDetails={handleViewDetails} />

              )}
            </div>
          </section>

          <section className="mb-8 md:mb-10 lg:mb-12">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-heading font-semibold text-foreground mb-2">
                  Smart Matches
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  Discover peers with complementary skills for your next exchange
                </p>
              </div>
              <Button
                variant="ghost"
                size="default"
                iconName="RefreshCw"
                iconPosition="left"
                className="hidden sm:flex">
                
                Refresh
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {smartMatches?.map((match) =>
              <SmartMatchCard
                key={match?.id}
                match={match}
                onConnectClick={handleConnectClick} />

              )}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-10 lg:mb-12">
            <div className="lg:col-span-2">
              <div className="mb-4 md:mb-6">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-heading font-semibold text-foreground mb-2">
                  Community Feed
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  Celebrate achievements and connect with fellow learners
                </p>
              </div>

              <div className="space-y-4 md:space-y-6">
                {communityFeed?.map((post) =>
                <CommunityFeedCard
                  key={post?.id}
                  post={post}
                  onLike={handlePostLike}
                  onComment={handlePostComment}
                  onShare={handlePostShare} />

                )}
              </div>

              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  size="default"
                  iconName="ChevronDown"
                  iconPosition="right">
                  
                  Load More Posts
                </Button>
              </div>
            </div>

            <div>
              <AIAssistantBlock
                tips={aiTips}
                onAskQuestion={handleAskQuestion} />
              
            </div>
          </div>

          <section>
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-heading font-semibold text-foreground mb-2">
                  Marketplace Preview
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  Featured skill offerings from expert instructors
                </p>
              </div>
              <Button
                variant="ghost"
                size="default"
                iconName="ArrowRight"
                iconPosition="right"
                className="hidden sm:flex">
                
                View All
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {marketplaceOfferings?.map((offering) =>
              <MarketplacePreviewCard
                key={offering?.id}
                offering={offering}
                onBookClick={handleBookClick}
                onViewProfile={handleViewProfile} />

              )}
            </div>
          </section>
      <ContextualModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        content={modalContent}
        theme="warm" />
      <NewExchangeModal
        isOpen={exchangeModalOpen}
        onClose={() => setExchangeModalOpen(false)} />
    </div>);

};

export default PersonalUserHub;