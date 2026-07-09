import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../convex/_generated/api';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ContextualModal from '../../components/ui/ContextualModal';

const levelColors = {
  Beginner: 'bg-success/20 text-success-foreground',
  Intermediate: 'bg-warning/20 text-warning-foreground',
  Advanced: 'bg-accent/30 text-accent-foreground',
};

const CoursesPage = () => {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'enrolled' | 'booked'
  const [processingId, setProcessingId] = useState(null); // id of offering currently processing
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: '' }
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const navigate = useNavigate();

  // Convex Queries & Mutations
  const offerings = useQuery(api.offerings.list);
  const enrollMutation = useMutation(api.offerings.enroll);
  const bookMutation = useMutation(api.offerings.book);
  const currentUser = useQuery(api.users.getCurrent);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleEnroll = async (offering) => {
    setModalContent({
      type: 'purchase-confirm',
      title: offering.title,
      price: offering.price,
      userBalance: currentUser?.skillCoins ?? 0,
      onConfirm: async () => {
        setModalContent((prev) => ({ ...prev, isProcessing: true }));
        try {
          await enrollMutation({ offeringId: offering._id });
          setModalContent({
            type: 'default',
            title: 'Enrollment Successful!',
            description: `You have successfully enrolled in "${offering.title}".`,
          });
          showNotification('success', `Successfully enrolled in "${offering.title}"!`);
        } catch (err) {
          console.error(err);
          setModalContent({
            type: 'default',
            title: 'Enrollment Failed',
            description: err.message || 'An error occurred during enrollment.',
          });
          showNotification('error', err.message || 'Payment failed.');
        }
      },
    });
    setModalOpen(true);
  };

  const handleBook = async (offering) => {
    setModalContent({
      type: 'purchase-confirm',
      title: offering.title,
      price: offering.price,
      userBalance: currentUser?.skillCoins ?? 0,
      onConfirm: async () => {
        setModalContent((prev) => ({ ...prev, isProcessing: true }));
        try {
          await bookMutation({ offeringId: offering._id });
          setModalContent({
            type: 'default',
            title: 'Booking Successful!',
            description: `You have successfully booked "${offering.title}".`,
          });
          showNotification('success', `Successfully booked a session for "${offering.title}"!`);
        } catch (err) {
          console.error(err);
          setModalContent({
            type: 'default',
            title: 'Booking Failed',
            description: err.message || 'An error occurred during booking.',
          });
          showNotification('error', err.message || 'Booking failed.');
        }
      },
    });
    setModalOpen(true);
  };

  if (!offerings) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Filtering based on tab
  const filteredOfferings = offerings.filter((o) => {
    if (activeTab === 'enrolled') return o.isEnrolled;
    if (activeTab === 'booked') return o.isBooked;
    return true;
  });

  return (
    <div className="relative">
      {/* Toast Notification Banner */}
      {notification && (
        <div className={`fixed top-20 right-6 z-[500] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-warm-lg animate-slide-in transition-all duration-300 border ${
          notification.type === 'success' 
            ? 'bg-success/10 border-success/35 text-success-foreground' 
            : 'bg-error/10 border-error/35 text-error-foreground'
        }`}>
          <Icon name={notification.type === 'success' ? 'CheckCircle2' : 'AlertCircle'} size={24} />
          <div>
            <p className="font-semibold text-sm">
              {notification.type === 'success' ? 'Success' : 'Transaction Failed'}
            </p>
            <p className="text-xs opacity-90">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
            SkillGarden Courses
          </h1>
          <p className="text-muted-foreground">
            Learn premium skills or book 1-on-1 sessions with expert mentors
          </p>
        </div>

        {/* Current Balance Display */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-secondary/80 backdrop-blur rounded-2xl border border-border/50 self-start md:self-auto shadow-warm animate-fade-in">
          <Icon name="Coins" size={22} color="var(--color-secondary-foreground)" />
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Your Wallet</p>
            <p className="font-mono font-bold text-foreground text-base">
              {currentUser?.skillCoins ?? 0} <span className="text-xs font-normal text-muted-foreground font-sans">coins</span>
            </p>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-border mb-8 gap-6">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-4 text-sm font-semibold transition-all relative ${
            activeTab === 'all' ? 'text-[#B794F4]' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Available Courses
          {activeTab === 'all' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full animate-scale-in" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('enrolled')}
          className={`pb-4 text-sm font-semibold transition-all relative ${
            activeTab === 'enrolled' ? 'text-[#B794F4]' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          My Enrolled Courses ({offerings.filter((o) => o.isEnrolled).length})
          {activeTab === 'enrolled' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full animate-scale-in" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('booked')}
          className={`pb-4 text-sm font-semibold transition-all relative ${
            activeTab === 'booked' ? 'text-[#B794F4]' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          My Booked Sessions ({offerings.filter((o) => o.isBooked).length})
          {activeTab === 'booked' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full animate-scale-in" />
          )}
        </button>
      </div>

      {/* Courses Grid */}
      {filteredOfferings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {filteredOfferings.map((offering) => {
            const isMutating = processingId === offering._id;
            return (
              <div
                key={offering._id}
                className="bg-card rounded-3xl border border-border overflow-hidden hover:shadow-warm-lg transition-all duration-300 hover:-translate-y-1.5 flex flex-col"
              >
                {/* Course Thumbnail */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={offering.coverImage || 'https://images.unsplash.com/photo-1542546068979-b6affb46ea8f'}
                    alt={offering.title}
                    className="w-full h-full object-cover"
                  />
                  <span
                    className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider shadow-sm ${levelColors[offering.level] || 'bg-muted text-muted-foreground'}`}
                  >
                    {offering.level}
                  </span>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  {/* Course Title */}
                  <h3 className="font-heading font-bold text-lg text-foreground mb-2 line-clamp-1">{offering.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1 line-clamp-2 font-sans">
                    {offering.description}
                  </p>

                  <div className="flex items-center gap-2 mb-4">
                    <img
                      src={offering.instructorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'}
                      alt={offering.instructorName}
                      className="w-8 h-8 rounded-full object-cover border border-border"
                    />
                    <span className="text-sm font-medium text-foreground">{offering.instructorName}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-6">
                    <span className="flex items-center gap-1.5">
                      <Icon name="Clock" size={14} color="var(--color-muted-foreground)" />
                      {offering.duration}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Icon name="Users" size={14} color="var(--color-muted-foreground)" />
                      {offering.studentsCount || 0} students
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Icon name="Star" size={14} color="var(--color-warning-foreground)" />
                      {offering.rating || 5.0}
                    </span>
                  </div>

                  {/* Required SkillCoins & Action Buttons */}
                  <div className="pt-4 border-t border-border space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground font-medium">Cost</span>
                      <div className="flex items-center gap-1.5">
                        <Icon name="Coins" size={18} color="var(--color-secondary-foreground)" />
                        <span className="text-xl font-bold font-mono text-foreground">{offering.price}</span>
                        <span className="text-xs text-muted-foreground font-medium font-sans">coins</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <Button
                        variant={offering.isEnrolled ? "success" : "default"}
                        size="sm"
                        fullWidth
                        disabled={offering.isEnrolled || isMutating}
                        onClick={() => handleEnroll(offering)}
                      >
                        {isMutating && processingId === offering._id ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : offering.isEnrolled ? (
                          <span className="flex items-center justify-center gap-1">
                            <Icon name="Check" size={14} /> Enrolled
                          </span>
                        ) : (
                          'Enroll'
                        )}
                      </Button>

                      {offering.isBooked ? (
                        <Button
                          variant="success"
                          size="sm"
                          fullWidth
                          onClick={() => {
                            if (offering.bookingSessionId) {
                              navigate(`/session/${offering.bookingSessionId}`);
                            } else {
                              showNotification('error', 'Session not initialized yet.');
                            }
                          }}
                        >
                          <span className="flex items-center justify-center gap-1">
                            <Icon name="Video" size={14} /> Join Session
                          </span>
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          fullWidth
                          disabled={isMutating}
                          onClick={() => handleBook(offering)}
                        >
                          {isMutating && processingId === offering._id ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            'Book Now'
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-card rounded-3xl border border-border border-dashed">
          <Icon name="BookOpen" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
          
          <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
            {activeTab === 'all' 
              ? 'New offerings will appear here as instructors post them.' 
              : 'Browse available courses to enroll or book sessions.'}
          </p>
          {activeTab !== 'all' && (
            <Button variant="default" size="sm" onClick={() => setActiveTab('all')}>
              Browse Courses
            </Button>
          )}
        </div>
      )}
      {/* Contextual Confirmation Modal */}
      <ContextualModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        content={modalContent}
        theme="warm"
      />
    </div>
  );
};

export default CoursesPage;
