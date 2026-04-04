import React, { useEffect, useMemo, useRef, useState } from 'react'
const getInitials = (value = '') => {
  const normalized = value.trim()
  if (!normalized) return '??'
  const parts = normalized.split(' ')
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return normalized.slice(0, 2).toUpperCase()
}

const LogoutMenu = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const initials = useMemo(() => getInitials(user?.username || user?.email || ''), [user])

  return (
    <div className='logout-menu' ref={menuRef}>
      <button
        type='button'
        className={`logout-menu__pill${isOpen ? ' is-open' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className='logout-menu__avatar'>{initials}</span>
        <span className='logout-menu__caret'>{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <div className='logout-menu__panel'>
          <div className='logout-menu__identity'>
            <span className='logout-menu__avatar logout-menu__avatar--panel'>{initials}</span>
            <div>
              <strong>{user?.email}</strong>
            </div>
          </div>
          <button type='button' className='logout-menu__action' onClick={onLogout}>Logout</button>
        </div>
      )}
    </div>
  )
}

export default LogoutMenu
