import React from 'react';
import { Button } from '@/app/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';

const AddIcon = () => (
  <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#424242', lineHeight: 1 }}>
    add_circle
  </span>
);

const HelpIcon = () => (
  <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#424242', lineHeight: 1 }}>
    help
  </span>
);

const MenuIcon = () => (
  <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#424242', lineHeight: 1 }}>
    menu
  </span>
);

export default function AppHeader({
  user = null,
  onAdd,
  onHelp,
  onAvatar,
  onMenu,
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '12px 24px',
      background: '#ffffff',
      borderBottom: '1px solid #e9e9eb',
      width: '100%',
      boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Button variant="ghost" size="icon" onClick={onAdd} aria-label="Add">
          <AddIcon />
        </Button>
        <Button variant="ghost" size="icon" onClick={onHelp} aria-label="Help">
          <HelpIcon />
        </Button>
        <button
          onClick={onAvatar}
          aria-label="Account"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Avatar style={{ width: 24, height: 24 }}>
            <AvatarImage src={user?.avatarSrc} alt={user?.name ?? 'User'} />
            <AvatarFallback>{user?.name?.charAt(0).toUpperCase() ?? 'U'}</AvatarFallback>
          </Avatar>
        </button>
        <Button variant="ghost" size="icon" onClick={onMenu} aria-label="Menu">
          <MenuIcon />
        </Button>
      </div>
    </div>
  );
}
