import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from 'framer-motion';
import { Avatar, Badge, Button, Chip, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import { Bell } from 'lucide-react';
import type { EditRequest } from '../../api/pages';

export interface EditNotification extends EditRequest {
  bookId: string;
  bookTitle: string;
}

interface HeaderProps {
  onLogout: () => void;
  username?: string;
  notifications?: EditNotification[];
  onResolveRequest?: (request: EditNotification, status: 'approved' | 'rejected') => Promise<void>;
}

const Header: React.FC<HeaderProps> = ({ onLogout, username = 'Writer', notifications = [], onResolveRequest }) => {
  const [notificationAnchor, setNotificationAnchor] = useState<HTMLElement | null>(null);
  return (
    <header className="sticky top-0 z-50 border-b border-[#373f42] bg-[#202b2f] text-[#fffaf0] shadow-[0_8px_30px_rgba(20,25,27,0.12)]">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link to="/dashboard" className="group flex items-center gap-3" aria-label="Go to dashboard">
          <motion.span whileHover={{ rotate: -4 }} className="grid h-9 w-9 place-items-center rounded-[10px] bg-[#e08a18] font-serif text-lg font-bold text-[#202b2f]">P</motion.span>
          <span className="font-serif text-xl font-semibold tracking-tight">Papertrail</span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Chip label="Live workspace" size="small" sx={{ display: { xs: 'none', sm: 'flex' }, color: '#f7c66b', borderColor: '#526065', backgroundColor: 'transparent', fontSize: 11 }} variant="outlined" />
          <IconButton aria-label={`${notifications.length} edit requests`} onClick={(event) => setNotificationAnchor(event.currentTarget)} sx={{ color: '#d6dedc' }}>
            <Badge badgeContent={notifications.length} color="warning"><Bell size={19} /></Badge>
          </IconButton>
          <Menu anchorEl={notificationAnchor} open={Boolean(notificationAnchor)} onClose={() => setNotificationAnchor(null)} PaperProps={{ sx: { mt: 1, minWidth: 310, borderRadius: 2, p: 1 } }}>
            {notifications.length === 0 ? <MenuItem disabled>No pending edit requests</MenuItem> : notifications.map((request) => <MenuItem key={request._id} sx={{ display: 'block', whiteSpace: 'normal', py: 1.5 }}><Typography variant="body2" sx={{ fontWeight: 700 }}>{typeof request.userId === 'string' ? request.userId : request.userId.username}</Typography><Typography variant="caption" color="text.secondary">wants to edit “{request.bookTitle}”</Typography><div className="mt-2 flex gap-2"><button type="button" onClick={() => { if (onResolveRequest) void onResolveRequest(request, 'approved'); }} className="text-xs font-bold text-[#4d7f59]">Approve</button><button type="button" onClick={() => { if (onResolveRequest) void onResolveRequest(request, 'rejected'); }} className="text-xs font-bold text-[#b9574e]">Reject</button></div></MenuItem>)}
          </Menu>
          <Link
            to="/profile"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#d6dedc] transition-colors hover:bg-white/10 hover:text-white"
          >
            <Avatar sx={{ width: 28, height: 28, bgcolor: '#e08a18', color: '#202b2f', fontSize: 13 }}>{username.charAt(0).toUpperCase()}</Avatar>
            <span className="hidden sm:inline">{username}</span>
          </Link>

          <Button
            component="button"
            size="small"
            onClick={onLogout}
            sx={{ color: '#d6dedc', minWidth: 0, display: { xs: 'none', sm: 'inline-flex' } }}
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;