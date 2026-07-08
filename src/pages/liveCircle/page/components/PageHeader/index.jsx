import React from 'react';
import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons';

export default function PageHeader({ profile, sideHidden, onToggleSide, onJumpLatest }) {
  return (
    <>
      <header className="header">
        <div>
          <h2>{profile.companyName || '-'}</h2>
          <div className="version">{profile.orgName || '-'}</div>
        </div>
        <div className="header-actions">
          <button
            className={`toggle-side-btn${sideHidden ? ' collapsed' : ''}`}
            type="button"
            aria-pressed={sideHidden}
            aria-label={sideHidden ? '退出全屏视图' : '进入全屏视图'}
            title={sideHidden ? '退出全屏视图' : '进入全屏视图'}
            onClick={onToggleSide}
          >
            <span className="icon">
              {sideHidden ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
            </span>
            <span className="label">{sideHidden ? '退出全屏视图' : '全屏视图'}</span>
          </button>
          <button className="btn" type="button" onClick={onJumpLatest}>定位到最新活动</button>
        </div>
      </header>
    </>
  );
}
