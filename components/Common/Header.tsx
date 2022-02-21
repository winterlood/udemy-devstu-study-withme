import PaddingContainer from "components/Common/PaddingContainer";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import style from "./Header.module.scss";
import MobileDrawer from "./MobileDrawer";

import { MenuOutlined } from "@ant-design/icons";
import Image from "next/image";

import BrandLogo from "public/image/pming_study_logo.png";
import { useRouter } from "next/router";
// ANTD

// COMPS

// STATICS

// TYPES

// COMPONENT

interface MenuList {
  link: string;
  display: string;
  isExternalPath?: boolean;
}

const MenuList: MenuList[] = [
  { link: "/", display: "홈" },
  { link: "/study", display: "스터디" },
  { link: "/post", display: "포스트" },
  {
    link: "https://devstu-udemy.netlify.app/",
    display: "스터디 멘토 지원",
    isExternalPath: true,
  },
  { link: "/help", display: "스터디 멘토 가이드" },
];

const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((v) => !v);
  }, []);

  const onCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  return (
    <header className={style.container}>
      <PaddingContainer>
        <div className={style.container_inner}>
          <div>
            <Link href={"/"} passHref>
              <a>
                <Image
                  src={BrandLogo.src}
                  width={"100"}
                  height={"29"}
                  alt="pming_study_logo"
                />
              </a>
            </Link>
          </div>

          <nav className={style.pc_nav}>
            {MenuList.map((it) => (
              <Link key={it.link} href={it.link}>
                <a
                  target={it.isExternalPath && "_blank"}
                  className={style.nav_item}
                >
                  {it.display}
                </a>
              </Link>
            ))}
          </nav>

          <div onClick={toggleDrawer} className={style.mobile_nav}>
            <MenuOutlined />
          </div>
        </div>
        <MobileDrawer
          isOpen={isDrawerOpen}
          onClose={onCloseDrawer}
          menuList={MenuList}
        />
      </PaddingContainer>
    </header>
  );
};

export default Header;
