import { useAgentProfile } from "./hooks/useAgentProfile";
import { useOwnerAuth } from "./hooks/useOwnerAuth";
import { useChatConversation } from "./hooks/useChatConversation";
import { DEFAULT_AVATAR } from "./types";
import { LandingHandleClaim } from "./components/LandingHandleClaim";
import { BioLinksSection } from "./components/BioLinksSection";
import { OwnerSidebarPanel } from "./components/OwnerSidebarPanel";
import { OwnerLoginModal } from "./components/OwnerLoginModal";
import { LeadModal } from "./components/LeadModal";
import { ChatInput } from "./components/ChatInput";
import { ChatMessageList } from "./components/ChatMessageList";
import { ProfileLoadingScreen, ProfileErrorScreen } from "./components/StatusScreens";

export default function App() {
  const {
    activeIdentifier,
    agent,
    setAgent,
    loadingProfile,
    profileError,
    handleSelectHandle,
    handleBackToHome,
  } = useAgentProfile();

  const {
    ownerToken,
    isOwner,
    isAdmin,
    showOwnerLogin,
    setShowOwnerLogin,
    showOwnerPanel,
    setShowOwnerPanel,
    handleOwnerLoginSuccess,
  } = useOwnerAuth(agent);

  const {
    messages,
    chatLoading,
    isTypingReply,
    showLeadModal,
    setShowLeadModal,
    messagesEndRef,
    handleSendMessage,
  } = useChatConversation(agent);

  // 1. Root Landing Page (Klaim & Cari Handle ala lynk.id)
  if (!activeIdentifier) {
    return (
      <LandingHandleClaim
        onSelectHandle={handleSelectHandle}
        isLoggedIn={Boolean(ownerToken)}
      />
    );
  }

  // 2. Loading Profile Screen
  if (loadingProfile) {
    return <ProfileLoadingScreen />;
  }

  // 3. Error Screen
  if (profileError || !agent) {
    return (
      <ProfileErrorScreen
        error={profileError}
        onBackToHome={handleBackToHome}
      />
    );
  }

  const avatarUrl = agent.avatar || DEFAULT_AVATAR;

  // Background styling: supports custom color (e.g. #f4f4f5), gradient, or image URL
  const bgValue = agent.pageBackground?.trim();
  const isBgImage = Boolean(
    bgValue &&
    (bgValue.startsWith("http://") || bgValue.startsWith("https://") || bgValue.startsWith("data:image/"))
  );
  const customBgStyle: React.CSSProperties = isBgImage
    ? {
        backgroundImage: `url("${bgValue}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }
    : bgValue
    ? { backgroundColor: bgValue }
    : {};

  return (
    <div
      className="h-dvh flex flex-col bg-[#fbfbfa] text-zinc-900 overflow-hidden transition-colors"
      style={customBgStyle}
    >
      {/* Main Container: Edge-to-edge, split columns on large screen without card outline wrapping */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden w-full">
        {/* Left Column: Bio Links & Brand Info (Desktop) */}
        <aside
          className={`hidden lg:flex lg:w-[380px] xl:w-[440px] 2xl:w-[480px] flex-shrink-0 border-r border-zinc-200/80 overflow-y-auto flex-col p-4 xl:p-6 transition-colors ${
            bgValue ? "bg-white/80 backdrop-blur-md" : "bg-white"
          }`}
        >
          <BioLinksSection
            name={agent.name}
            avatar={agent.avatar}
            bio={agent.bio}
            links={agent.links}
            adminWhatsApp={agent.adminWhatsApp}
            avatarStyle={agent.avatarStyle}
            isOwner={isOwner}
            showOwnerPanel={showOwnerPanel}
            onToggleOwnerPanel={() => setShowOwnerPanel(!showOwnerPanel)}
            onOpenOwnerLogin={() => setShowOwnerLogin(true)}
          />
        </aside>

        {/* Center/Main Chat Column */}
        <div
          className={`flex-1 flex flex-col overflow-hidden h-full min-w-0 transition-colors ${
            bgValue ? "bg-transparent" : "bg-white"
          }`}
        >
          {/* Scrollable Area containing Bio Links on mobile + Chat History */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* On mobile: BioLinksSection displayed at top */}
            <div className="lg:hidden mb-2">
              <BioLinksSection
                name={agent.name}
                avatar={agent.avatar}
                bio={agent.bio}
                links={agent.links}
                adminWhatsApp={agent.adminWhatsApp}
                avatarStyle={agent.avatarStyle}
                isOwner={isOwner}
                showOwnerPanel={showOwnerPanel}
                onToggleOwnerPanel={() => setShowOwnerPanel(!showOwnerPanel)}
                onOpenOwnerLogin={() => setShowOwnerLogin(true)}
              />
            </div>

            {/* AI Chat Header/Indicator */}
            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-zinc-100" />
              <span className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wider">
                Asisten Chat AI
              </span>
              <div className="h-px flex-1 bg-zinc-100" />
            </div>

            {/* Chat Messages */}
            <ChatMessageList
              messages={messages}
              chatLoading={chatLoading}
              avatarUrl={avatarUrl}
              agentName={agent.name}
              avatarStyle={agent.avatarStyle}
              themeColor={agent.widgetColor}
              messagesEndRef={messagesEndRef}
            />
          </main>

          {/* Chat Input Bar */}
          <ChatInput
            onSendMessage={handleSendMessage}
            loading={chatLoading || isTypingReply}
            suggestions={agent.suggestedQuestions}
            themeColor={agent.widgetColor}
            hasCustomBg={Boolean(bgValue)}
          />
        </div>

        {/* Side Panel (Kanan luar chat untuk mode pemilik tanpa modal) */}
        {isOwner && showOwnerPanel && ownerToken && (
          <aside className="w-[460px] xl:w-[500px] flex-shrink-0 h-full hidden lg:block animate-in slide-in-from-right duration-200">
            <OwnerSidebarPanel
              agent={agent}
              token={ownerToken}
              isAdmin={isAdmin}
              onClose={() => setShowOwnerPanel(false)}
              onProfileUpdated={(updated) => setAgent(updated)}
            />
          </aside>
        )}

        {/* Mobile Floating Drawer for Owner Panel on small screens */}
        {isOwner && showOwnerPanel && ownerToken && (
          <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs lg:hidden flex justify-end">
            <div className="w-full max-w-lg h-full bg-white shadow-2xl animate-in slide-in-from-right duration-200">
              <OwnerSidebarPanel
                agent={agent}
                token={ownerToken}
                isAdmin={isAdmin}
                onClose={() => setShowOwnerPanel(false)}
                onProfileUpdated={(updated) => setAgent(updated)}
              />
            </div>
          </div>
        )}

        {/* Lead Capture Modal */}
        {agent.enableLeadCapture && (
          <LeadModal
            agentId={agent.id}
            isOpen={showLeadModal}
            onClose={() => setShowLeadModal(false)}
            title={agent.leadTitle}
            themeColor={agent.widgetColor}
          />
        )}

        {/* Owner Login Modal */}
        <OwnerLoginModal
          isOpen={showOwnerLogin}
          onClose={() => setShowOwnerLogin(false)}
          onSuccess={handleOwnerLoginSuccess}
        />
      </div>
    </div>
  );
}
