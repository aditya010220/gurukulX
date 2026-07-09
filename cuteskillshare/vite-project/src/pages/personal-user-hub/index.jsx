import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import ContextualModal from '../../components/ui/ContextualModal';
import NewExchangeModal from '../../components/NewExchangeModal';
import HeroWelcomeCard from './components/HeroWelcomeCard';
import OngoingExchangeCard from './components/OngoingExchangeCard';
import SmartMatchCard from './components/SmartMatchCard';
import AIAssistantBlock from './components/AIAssistantBlock';
import CommunityFeedCard from './components/CommunityFeedCard';
import MarketplacePreviewCard from './components/MarketPlacePreviewCard';
import { getTimeAgo } from '../../utils/getTimeAgo';

import Button from '../../components/ui/Button';

const PersonalUserHub = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);

  // ─── Convex Queries (real-time) ─────────────────────────────
  const convexUser = useQuery(api.users.getCurrent);
  const activeExchanges = useQuery(api.exchanges.getActive);
  const convexSmartMatches = useQuery(api.smartMatches.getForUser, {});
  const communityPosts = useQuery(api.posts.list, { limit: 10 });
  const featuredOfferings = useQuery(api.offerings.getFeatured);
  const refreshMatches = useMutation(api.smartMatches.refresh);
  const bookMutation = useMutation(api.offerings.book);

  const handleBookClick = (offering) => {
    setModalContent({
      type: 'purchase-confirm',
      title: offering.title,
      price: offering.price,
      userBalance: userData.skillCoins,
      onConfirm: async () => {
        setModalContent((prev) => ({ ...prev, isProcessing: true }));
        try {
          if (offering.id && typeof offering.id === 'string' && offering.id.length > 5) {
            await bookMutation({ offeringId: offering.id });
          }
          setModalContent({
            type: 'default',
            title: 'Booking Successful!',
            description: `You have successfully booked "${offering.title}". A calendar session has been created. Check it under 'My Booked Sessions' on the View Courses page.`,
          });
        } catch (err) {
          console.error('Booking failed:', err.message);
          setModalContent({
            type: 'default',
            title: 'Booking Failed',
            description: err.message || 'An error occurred during booking. Please try again.',
          });
        }
      },
    });
    setModalOpen(true);
  };

  const handleViewProfile = (offering) => {
    console.log('View profile:', offering);
  };

  const userData = {
    name: convexUser?.name || user?.fullName || user?.firstName || "Guest User",
    email: convexUser?.email || user?.primaryEmailAddress?.emailAddress || "",
    skillCoins: convexUser?.skillCoins ?? 0,
    currentStreak: convexUser?.currentStreak ?? 0,
    totalExchanges: convexUser?.totalExchanges ?? 0
  };

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

  // ─── Ongoing Exchanges from Convex (fallback to mock) ──────
  const ongoingExchanges = activeExchanges && activeExchanges.length > 0 ? activeExchanges.map((e) => ({
    id: e._id,
    partnerName: e.partnerName,
    partnerAvatar: e.partnerAvatar || "",
    partnerAvatarAlt: `${e.partnerName} avatar`,
    partnerTitle: e.partnerTitle || "",
    teachingSkill: e.teachingSkill,
    learningSkill: e.learningSkill,
    completedSessions: e.completedSessions,
    totalSessions: e.totalSessions,
    nextSession: e.nextSession
  })) : [
  {
    id: 1,
    partnerName: "Astha Singh",
    partnerAvatar: "https://i.pinimg.com/736x/34/fc/e9/34fce9b56c7b4781d101d7e073b5ddb3.jpg",
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
    partnerName: "Athreya",
    partnerAvatar: "https://i.pinimg.com/736x/2e/90/b6/2e90b63ad738da3d1153c3b2ee00bbf4.jpg",
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
    partnerName: "Manish Verma",
    partnerAvatar: "https://i.pinimg.com/vwebpf/1200x/62/16/9f/62169fb4f961f71ff689f1d6a215dc6f.webp",
    partnerAvatarAlt: "Professional headshot of Caucasian woman with blonde hair in gray blazer with friendly demeanor",
    partnerTitle: "Data Scientist",
    teachingSkill: "Web Development Basics",
    learningSkill: "Python for Data Analysis",
    completedSessions: 8,
    totalSessions: 10,
    nextSession: "Feb 15, 2026 at 2:00 PM"
  }];


  // ─── Smart Matches from Convex (fallback to mock) ──────────
  const smartMatches = convexSmartMatches && convexSmartMatches.length > 0 ? convexSmartMatches.map((m) => ({
    id: m._id,
    name: m.matchedUserName,
    avatar: m.matchedUserAvatar || "",
    avatarAlt: `${m.matchedUserName} avatar`,
    title: m.matchedUserTitle || "",
    compatibilityScore: m.compatibilityScore,
    canTeach: m.matchedUserSkills || [],
    wantsToLearn: m.matchedUserLearningGoals || [],
    location: "",
    rating: 0
  })) : [
  {
    id: 1,
    name: "Veer Chaudhary",
    avatar: "https://i.pinimg.com/736x/17/94/30/179430bbe08926ede2e09a7771622a06.jpg",
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
    name: "Ananya Iyer",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200",
    avatarAlt: "Professional headshot of Indian woman with a warm smile",
    title: "UX Researcher",
    compatibilityScore: 92,
    canTeach: ["User Research", "Figma", "Design Thinking", "Prototyping"],
    wantsToLearn: ["JavaScript", "React", "Frontend Development"],
    location: "Mumbai, India",
    rating: 4.8
  },
  {
    id: 3,
    name: "Rohan Sharma",
    avatar: "https://i.pinimg.com/736x/9c/18/6d/9c186d97a529fb5d001df98846c45425.jpg",
    avatarAlt: "Professional headshot of Indian man with glasses",
    title: "DevOps Engineer",
    compatibilityScore: 88,
    canTeach: ["Docker", "Kubernetes", "AWS", "CI/CD","Jenkins"],
    wantsToLearn: ["React", "Node.js", "Full Stack Development"],
    location: "Delhi, India",
    rating: 4.7
  },
  {
    id: 4,
    name: "Priya Patel",
    avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&q=80&w=200",
    avatarAlt: "Professional headshot of Indian woman with glasses wearing professional blouse",
    title: "Machine Learning Engineer",
    compatibilityScore: 85,
    canTeach: ["Python", "TensorFlow", "Machine Learning", "Data Science"],
    wantsToLearn: ["Web Development", "React", "JavaScript"],
    location: "Bangalore, India",
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


  // ─── Community Feed from Convex (fallback to mock) ─────────
  const communityFeed = communityPosts && communityPosts.length > 0 ? communityPosts.map((p) => ({
    id: p._id,
    authorName: p.authorName || 'Unknown',
    authorAvatar: p.authorAvatar || '',
    authorAvatarAlt: `${p.authorName || 'User'} avatar`,
    isVerified: false,
    timeAgo: getTimeAgo(p.createdAt),
    content: p.content,
    achievement: p.achievement || null,
    skillTags: p.skillTags || [],
    likes: p.likes ?? 0,
    comments: p.commentsCount ?? 0,
    isLiked: p.isLiked ?? false
  })) : [
  {
    id: 1,
    authorName: "Yash Pratap Singh",
    authorAvatar: "https://i.pinimg.com/736x/11/a6/05/11a605716a44cd54805db220e577629e.jpg",
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
    authorName: "Shreya Gupta",
    authorAvatar: "https://i.pinimg.com/736x/77/c3/6b/77c36b6eea6a5df964a9f3b150163bc9.jpg",
    authorAvatarAlt: "Professional headshot of Indian woman with short black hair in navy suit and confident expression",
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
    authorName: "Abhishek Verma",
    authorAvatar: "https://i.pinimg.com/1200x/d0/96/30/d09630a68ff721c6fff999f138d33d33.jpg",
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
    authorName: "Riya Malhotra",
    authorAvatar: "https://i.pinimg.com/736x/27/71/d1/2771d1549c2b569dc5acd3d51e28c1d8.jpg",
    authorAvatarAlt: "Professional headshot of Hispanic man with beard wearing green shirt and professional demeanor",
    isVerified: true,
    timeAgo: "1 day ago",
    content: "Reached 1500 SkillCoins today! 💰 The reward system really motivates consistent learning. Already planning my next skill exchange with Priya to learn Machine Learning basics.",
    skillTags: ["Milestone", "SkillCoins", "MachineLearning"],
    likes: 67,
    comments: 20,
    isLiked: true
  }];


  // ─── Marketplace Offerings from Convex (fallback to mock) ──
  const marketplaceOfferings = featuredOfferings && featuredOfferings.length > 0 ? featuredOfferings.map((o) => ({
    id: o._id,
    title: o.title,
    coverImage: o.coverImage || '',
    coverImageAlt: `${o.title} cover`,
    instructorName: o.instructorName || 'Unknown',
    instructorAvatar: o.instructorAvatar || '',
    instructorAvatarAlt: `${o.instructorName || 'Instructor'} avatar`,
    description: o.description,
    duration: o.duration,
    students: o.studentsCount ?? 0,
    level: o.level,
    rating: o.rating ?? 0,
    price: o.price ?? 0
  })) : [
  {
    id: 1,
    title: "Advanced React Patterns",
    coverImage: "https://images.unsplash.com/photo-1542546068979-b6affb46ea8f",
    coverImageAlt: "Modern workspace with laptop displaying colorful React code on screen with coffee cup and notebook",
    instructorName: "Manisha",
    instructorAvatar: "https://i.pinimg.com/736x/58/79/a7/5879a7c00934f9865728909942f170a5.jpg",
    instructorAvatarAlt: "Professional headshot of Asian woman with long black hair wearing white blouse and warm smile",
    description: "Master advanced React patterns including compound components, render props, and custom hooks. Perfect for developers looking to level up their React skills.",
    duration: "8 weeks",
    students: 124,
    level: "Advanced",
    rating: 4.9,
    price: 12
  },
  {
    id: 2,
    title: "UI/UX Design Fundamentals",
    coverImage: "https://images.unsplash.com/photo-1675317120753-ce28b951e9e8",
    coverImageAlt: "Designer workspace with Figma interface open showing colorful UI mockups and design tools",
    instructorName: "Aarav",
    instructorAvatar: "https://i.pinimg.com/1200x/09/7c/14/097c1445d3282217eb7d57acb44f2166.jpg",
    instructorAvatarAlt: "Professional headshot of Hispanic man with short black hair in navy suit and confident expression",
    description: "Learn the principles of user-centered design, from wireframing to prototyping. Includes hands-on projects and real-world case studies.",
    duration: "6 weeks",
    students: 89,
    level: "Beginner",
    rating: 4.8,
    price: 8
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
    price: 15
  },
  {
    id: 4,
    title: "Mobile App Development",
    coverImage: "https://images.unsplash.com/photo-1595846870485-df6f64d1e510",
    coverImageAlt: "Smartphone displaying mobile app interface with developer tools and code editor in background",
    instructorName: "Arpit Patel",
    instructorAvatar: "https://i.pinimg.com/1200x/ee/ce/00/eece00bb1f5841986ab10ecb3e954897.jpg",
    instructorAvatarAlt: "Professional headshot of Asian man with glasses wearing blue shirt and welcoming smile",
    description: "Build cross-platform mobile apps with React Native. Learn navigation, state management, and deployment to app stores.",
    duration: "12 weeks",
    students: 98,
    level: "Intermediate",
    rating: 4.7,
    price: 10
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
    setModalContent({
      type: 'exchange-details',
      partnerName: exchange?.partnerName,
      partnerAvatar: exchange?.partnerAvatar,
      partnerAvatarAlt: exchange?.partnerAvatarAlt,
      partnerTitle: exchange?.partnerTitle,
      teachingSkill: exchange?.teachingSkill,
      learningSkill: exchange?.learningSkill,
      completedSessions: exchange?.completedSessions,
      totalSessions: exchange?.totalSessions,
      nextSession: exchange?.nextSession
    });
    setModalOpen(true);
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

            <div className="flex overflow-x-auto pb-4 gap-4 md:gap-6 scrollbar-warm snap-x snap-mandatory scroll-smooth -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              {ongoingExchanges?.map((exchange) => (
                <div key={exchange?.id} className="w-[280px] sm:w-[320px] md:w-[350px] snap-start flex-shrink-0 hover:scale-[1.01] transition-all duration-300">
                  <OngoingExchangeCard
                    exchange={exchange}
                    onScheduleClick={handleScheduleClick}
                    onViewDetails={handleViewDetails} />
                </div>
              ))}
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
                className="hidden sm:flex"
                onClick={() => refreshMatches()}>
                
                Refresh
              </Button>
            </div>

            <div className="flex overflow-x-auto pb-4 gap-4 md:gap-6 scrollbar-warm snap-x snap-mandatory scroll-smooth -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              {smartMatches?.map((match) => (
                <div key={match?.id} className="w-[280px] sm:w-[320px] md:w-[350px] snap-start flex-shrink-0 hover:scale-[1.01] transition-all duration-300">
                  <SmartMatchCard
                    match={match}
                    onConnectClick={handleConnectClick} />
                </div>
              ))}
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

            <div className="flex overflow-x-auto pb-4 gap-4 md:gap-6 scrollbar-warm snap-x snap-mandatory scroll-smooth -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              {marketplaceOfferings?.map((offering) => (
                <div key={offering?.id} className="w-[280px] sm:w-[320px] md:w-[350px] snap-start flex-shrink-0 hover:scale-[1.01] transition-all duration-300">
                  <MarketplacePreviewCard
                    offering={offering}
                    onBookClick={handleBookClick}
                    onViewProfile={handleViewProfile} />
                </div>
              ))}
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