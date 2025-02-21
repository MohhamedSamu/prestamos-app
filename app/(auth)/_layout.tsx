import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { ReactNode } from "react";
import Loader from "../../components/Loader";

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => (
  <>
    {children}
    <Loader isLoading={false} />
    <StatusBar backgroundColor="#161622" style="light" />
  </>
);

const AuthLayout = () => {
  const loading = false;
  const isLogged = false;

  if (!loading && isLogged) return <Redirect href="/home" />;

  return (
    <Layout>
      <Stack>
        <Stack.Screen
          name="sign-in"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </Layout>
  );
};

export default AuthLayout;
