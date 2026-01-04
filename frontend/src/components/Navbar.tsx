'use client';

import { navItems } from '@/utils/navItems';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const Navbar = () => {
  const [openMenu, setOpenMenu] = useState(false);
  const { dataUser, logout } = useAuth();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      if (window.scrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  if (!isClient) {
    return (
      <nav className='bg-blue-300 w-full z-20 top-0 start-0 border-b border-default'>
        <div className='max-w-7xl flex items-center justify-between mx-auto p-4'>
          <div className='flex items-center space-x-3'>
            <Link href='/' className='flex items-center gap-2'>
              <img src='/logo2.png' alt='Logo clinica' className='h-15 w-35' />
            </Link>
          </div>
          <div className='hidden md:flex items-center gap-10 text-white'>
            {navItems.map((item) => (
              <span key={item.id} className='px-3 py-2 opacity-0'>
                {item.name}
              </span>
            ))}
            <span className='px-3 py-2 opacity-0'>Auth</span>
          </div>
        </div>
      </nav>
    );
  }

  const getDisplayName = () => {
    if (dataUser?.user?.first_name && dataUser.user.last_name) {
      return `${dataUser.user.first_name} ${dataUser.user.last_name}`;
    }
    return dataUser?.user?.email || 'Usuario';
  };

  const getRole = () => {
    return dataUser?.user?.role || 'usuario';
  };

  return (
    <nav
      className={`bg-blue-300 w-full z-20 top-0 start-0 border-b border-default transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className='max-w-7xl flex flex-wrap items-center justify-between mx-auto p-4'>
        <div className='flex items-center space-x-3 rtl:space-x-reverse'>
          <Link href='/' className='flex items-center gap-2'>
            <img src='/logo2.png' alt='Logo clinica' className='h-15 w-35' />
          </Link>
        </div>

        <button
          className='md:hidden text-white text-2xl transition cursor-pointer'
          onClick={() => setOpenMenu(!openMenu)}
        >
          ☰
        </button>

        <div className='hidden w-full md:block md:w-auto' id='navbar-default'>
          <div className='hidden md:flex items-center gap-10 ml-10 text-white'>
            {navItems.map((navigationItem) => (
              <Link
                key={navigationItem.id}
                href={navigationItem.route}
                className='text-white hover:bg-cyan-800 px-3 py-2 rounded-3xl transition cursor-pointer'
              >
                {navigationItem.name}
              </Link>
            ))}
              {dataUser && (
                  <Link href="/dashboard/patient" className='text-white hover:bg-cyan-800 px-3 py-2 rounded-3xl transition cursor-pointer'>
                    Mis turnos
                  </Link>
                )}

            <div>
              {!dataUser ? (
                <div className='hidden md:flex items-center gap-10'>
                  <Link
                    href='/auth/login'
                    className='text-white hover:bg-cyan-800 px-3 py-2 rounded-3xl transition cursor-pointer'
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href='/auth/register'
                    className='text-white hover:bg-cyan-800 px-3 py-2 rounded-3xl transition cursor-pointer'
                  >
                    Registrarse
                  </Link>
                </div>
              ) : (
                <div className='flex flex-col md:flex-row md:items-center gap-1'>
                  <div className='text-xs text-blue-900 font-bold space-y-0.5 md:space-y-0 md:mr-4 text-center cursor-pointer'>
                    <Link href="/dashboard/patient" onClick={() => setOpenMenu(false)}>
                    <div>Bienvenid@</div>
                    <div className='text-base text-blue-900 hover:text-white transition'>
                      {getDisplayName()}
                    </div>
                    <div className='text-xs text-blue-900 capitalize'>
                      {getRole()}
                    </div>
                    </Link>
                  </div>
                  <button
                    onClick={logout}
                    className='text-sm ml-2 bg-blue-600 hover:bg-red-700 text-white font-bold px-4 py-1 rounded-3xl transition cursor-pointer'
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {openMenu && (
        <div className='md:hidden bg-chocolate border-t border-default w-full flex flex-col items-center gap-4 py-4'>
          {navItems.map((navigationItem) => (
            <Link
              key={navigationItem.id}
              href={navigationItem.route}
              className='text-white font-bold hover:text-cyan-800 transition mt-2'
              onClick={() => setOpenMenu(false)}
            >
              {navigationItem.name}
            </Link>
          ))}

          {dataUser && (
            <Link href='/dashboard/patient' className='text-white font-bold hover:text-cyan-800 transition mt-2' onClick={() => setOpenMenu(false)}>
              Mis turnos
            </Link>
          )}

          {!dataUser ? (
            <div className='flex flex-col items-center gap-2 mt-4'>
              <Link
                href='/auth/login'
                className='text-white font-bold px-3 py-2 rounded-3xl hover:text-white mb-2'
                onClick={() => setOpenMenu(false)}
              >
                Iniciar sesión
              </Link>
              <Link
                href='/auth/register'
                className='text-white font-bold px-3 py-2 rounded-3xl hover:text-white mb-2'
                onClick={() => setOpenMenu(false)}
              >
                Registrarse
              </Link>
            </div>
          ) : (
            <div className='flex flex-col items-center gap-2 mt-4'>
                <Link href='/dashboard/patient' onClick={() => setOpenMenu(false)}>
              <div className='text-center text-white font-bold text-lg hover:text-cyan-800 transition mb-2'>
                Hola, bienvenid@
                <br />
                {getDisplayName()}
                <br />
                <span className='text-xs text-gray-300 capitalize'>
                  ({getRole()})
                </span>
              </div>
                </Link>
              <button
                onClick={() => {
                  logout();
                  setOpenMenu(false);
                }}
                className='text-white font-bold px-4 py-2 rounded-3xl mb-3 bg-red-600 hover:bg-red-700 transition cursor-pointer'
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
