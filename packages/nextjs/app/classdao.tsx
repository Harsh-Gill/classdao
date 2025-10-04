"use client";

import type { NextPage } from "next";
import { Suspense } from "react";
import { ClassDAOApp } from "~~/components/ClassDAOApp";

const Home: NextPage = () => {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[400px]"><span className="loading loading-spinner loading-lg"></span></div>}>
      <ClassDAOApp />
    </Suspense>
  );
};

export default Home;