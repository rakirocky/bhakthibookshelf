import { getCustomerSession } from "../lib/auth/getCustomerSession";
import CheckoutClient from "./CheckoutClient";

export default async function CheckoutPage() {
  const session = await getCustomerSession();

  return <CheckoutClient signedIn={session !== null} />;
}
