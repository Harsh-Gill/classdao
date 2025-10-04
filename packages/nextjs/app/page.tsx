"use client";

import type { NextPage } from "next";
import { Suspense } from "react";
import { ClassDAOApp } from "~~/components/ClassDAOApp";

const Home: NextPage = () => {
  return (
    <>
      <div className="flex items-center flex-col grow">
        <div className="w-full">
          <Suspense fallback={<div className="flex justify-center items-center min-h-[400px]"><span className="loading loading-spinner loading-lg"></span></div>}>
            <ClassDAOApp />
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default Home;
