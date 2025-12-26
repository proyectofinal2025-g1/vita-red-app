'use client';

import { navItems } from '@/utils/navItems';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export const Navbar = () => {
  const [openMenu, setOpenMenu] = useState(false);

  const { dataUser, logout } = useAuth();

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
            {navItems.map((navigationItem) => {
              return (
                <Link
                  key={navigationItem.id}
                  href={navigationItem.route}
                  className=' text-white hover:bg-cyan-800 px-3 py-2 rounded-3xl transition cursor-pointer'
                >
                  {navigationItem.name}
                </Link>
              );
            })}

            <div>
              {!dataUser ? (
                <div className='hidden md:flex items-center gap-10'>

                  <Link
                    href='/auth/login'
                    className=' text-white hover:bg-cyan-800 px-3 py-2 rounded-3xl transition cursor-pointer'
                  >
                    Iniciar sesión
                  </Link>

                  <Link
                    href='/auth/register'
                    className=' text-white hover:bg-cyan-800 px-3 py-2 rounded-3xl transition cursor-pointer'
                  >
                    Registrarse
                  </Link>
                </div>
              ) : (
                <div>
                  <Link href='/profile' className='text-bone font-bold'>
                    {dataUser.user?.first_name} {dataUser.user?.last_name}
                  </Link>
                  <Link href='/auth/login'>
                    <button
                      onClick={logout}
                      className='text-white font-bold hover:bg-cyan-800 px-3 py-1 rounded-3xl transition cursor-pointer'
                    >
                      Cerrar sesión
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {openMenu && (
        <div className='md:hidden bg-chocolate border-t border-default w-full flex flex-col items-center gap-4'>
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

          {!dataUser ? (
            <div className='flex flex-col items-center gap-2'>

              <Link
                href='/auth/login'
                className='text-white font-bold px-3 py-2 rounded-3xl hover:text-white mb-2'
              >
                Iniciar sesión
              </Link>

              <Link
                href='/auth/register'
                className='text-white font-bold px-3 py-2 rounded-3xl hover:text-white mb-2'
              >
                Registrarse
              </Link>
            </div>
          ) : (
            <div className='flex flex-col items-center gap-2'>
              <Link
                href='/profile'
                onClick={() => setOpenMenu(false)}
                className=' text-white font-bold hover:text-cyan-800'
              >
                {dataUser.user?.first_name} {dataUser.user?.last_name}
              </Link>
              <button
                onClick={logout}
                className='text-white font-bold px-3 py-1 rounded-3xl mb-3 hover:bg-cyan-800 transition cursor-pointer'
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
