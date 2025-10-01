"use client";

import type { NextPage } from "next";
import { ClassDAOApp } from "~~/components/ClassDAOApp";

const Home: NextPage = () => {
  return (
    <>
      <div className="flex items-center flex-col grow">
        <div className="w-full">
          <ClassDAOApp />
        </div>
      </div>
    </>
  );
};

export default Home;
