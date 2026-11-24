package com.bhakthibookshelf.app;

import androidx.annotation.NonNull;

import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Google Play Billing for the website running inside the app (JS name
 * "PlayBilling"). Deliberately thin: it starts purchases and lists the
 * ones Play knows about; the server verifies every purchase token with
 * Google and acknowledges it (app/lib/services/storePurchaseService.ts),
 * so nothing here decides whether a book is unlocked.
 *
 * Products are one-time ("inapp"): book_<id> per book, plan_<id> for the
 * lifetime plan.
 */
@CapacitorPlugin(name = "PlayBilling")
public class PlayBillingPlugin extends Plugin implements PurchasesUpdatedListener {

    private BillingClient billing;
    /** The purchase() call waiting for Google's payment sheet to finish. */
    private PluginCall pendingPurchaseCall;

    @Override
    public void load() {
        billing = BillingClient.newBuilder(getContext())
            .setListener(this)
            .enablePendingPurchases(
                PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
            .enableAutoServiceReconnection()
            .build();
    }

    @Override
    protected void handleOnDestroy() {
        if (billing != null) billing.endConnection();
        super.handleOnDestroy();
    }

    /** Runs `then` once connected, or rejects the call with Play's reason. */
    private void whenReady(PluginCall call, Runnable then) {
        if (billing.isReady()) {
            then.run();
            return;
        }
        billing.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(@NonNull BillingResult result) {
                if (result.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    then.run();
                } else {
                    call.reject(describe(result), codeName(result.getResponseCode()));
                }
            }

            @Override
            public void onBillingServiceDisconnected() {
                // enableAutoServiceReconnection() reconnects on the next call.
            }
        });
    }

    @PluginMethod
    public void isAvailable(PluginCall call) {
        whenReady(call, () -> {
            JSObject ret = new JSObject();
            ret.put("available", true);
            call.resolve(ret);
        });
    }

    @PluginMethod
    public void getProducts(PluginCall call) {
        JSArray ids = call.getArray("productIds");
        if (ids == null || ids.length() == 0) {
            call.reject("productIds is required");
            return;
        }
        List<QueryProductDetailsParams.Product> products = new ArrayList<>();
        try {
            for (int i = 0; i < ids.length(); i++) {
                products.add(QueryProductDetailsParams.Product.newBuilder()
                    .setProductId(ids.getString(i))
                    .setProductType(BillingClient.ProductType.INAPP)
                    .build());
            }
        } catch (Exception e) {
            call.reject("productIds must be strings");
            return;
        }
        whenReady(call, () -> billing.queryProductDetailsAsync(
            QueryProductDetailsParams.newBuilder().setProductList(products).build(),
            (result, details) -> {
                if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                    call.reject(describe(result), codeName(result.getResponseCode()));
                    return;
                }
                JSArray out = new JSArray();
                for (ProductDetails d : details.getProductDetailsList()) {
                    out.put(productJson(d));
                }
                JSObject ret = new JSObject();
                ret.put("products", out);
                call.resolve(ret);
            }));
    }

    /**
     * Opens Google's payment sheet. Options: productId, accountToken
     * (our server's per-customer token, sent to Google as
     * obfuscatedAccountId so the server can tell whose purchase it is).
     * Resolves { status: "purchased" | "pending" | "cancelled" |
     * "already_owned", purchases: [...] }.
     */
    @PluginMethod
    public void purchase(PluginCall call) {
        String productId = call.getString("productId");
        String accountToken = call.getString("accountToken");
        if (productId == null || accountToken == null) {
            call.reject("productId and accountToken are required");
            return;
        }
        if (pendingPurchaseCall != null) {
            call.reject("A purchase is already in progress", "BUSY");
            return;
        }
        whenReady(call, () -> billing.queryProductDetailsAsync(
            QueryProductDetailsParams.newBuilder()
                .setProductList(Collections.singletonList(
                    QueryProductDetailsParams.Product.newBuilder()
                        .setProductId(productId)
                        .setProductType(BillingClient.ProductType.INAPP)
                        .build()))
                .build(),
            (result, details) -> {
                if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                    call.reject(describe(result), codeName(result.getResponseCode()));
                    return;
                }
                if (details.getProductDetailsList().isEmpty()) {
                    call.reject("This item isn't available on Google Play yet.", "ITEM_UNAVAILABLE");
                    return;
                }
                ProductDetails product = details.getProductDetailsList().get(0);
                BillingFlowParams flow = BillingFlowParams.newBuilder()
                    .setProductDetailsParamsList(Collections.singletonList(
                        BillingFlowParams.ProductDetailsParams.newBuilder()
                            .setProductDetails(product)
                            .build()))
                    .setObfuscatedAccountId(accountToken)
                    .build();

                getActivity().runOnUiThread(() -> {
                    call.setKeepAlive(true);
                    pendingPurchaseCall = call;
                    BillingResult launch = billing.launchBillingFlow(getActivity(), flow);
                    if (launch.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                        pendingPurchaseCall = null;
                        call.setKeepAlive(false);
                        settleLaunchFailure(call, launch);
                    }
                });
            }));
    }

    /** Every purchase Play currently holds for this Google account. */
    @PluginMethod
    public void queryPurchases(PluginCall call) {
        whenReady(call, () -> billing.queryPurchasesAsync(
            QueryPurchasesParams.newBuilder()
                .setProductType(BillingClient.ProductType.INAPP)
                .build(),
            (result, purchases) -> {
                if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                    call.reject(describe(result), codeName(result.getResponseCode()));
                    return;
                }
                JSObject ret = new JSObject();
                ret.put("purchases", purchasesJson(purchases));
                call.resolve(ret);
            }));
    }

    @Override
    public void onPurchasesUpdated(@NonNull BillingResult result, List<Purchase> purchases) {
        PluginCall call = pendingPurchaseCall;
        pendingPurchaseCall = null;

        JSArray list = purchasesJson(purchases);

        // Purchases can also arrive with no call waiting (a pending UPI
        // payment completing later) — tell the page so it can verify.
        if (call == null) {
            if (result.getResponseCode() == BillingClient.BillingResponseCode.OK && list.length() > 0) {
                JSObject event = new JSObject();
                event.put("purchases", list);
                notifyListeners("purchasesUpdated", event, true);
            }
            return;
        }

        call.setKeepAlive(false);
        int code = result.getResponseCode();
        JSObject ret = new JSObject();
        ret.put("purchases", list);

        if (code == BillingClient.BillingResponseCode.OK) {
            boolean anyPurchased = false;
            if (purchases != null) {
                for (Purchase p : purchases) {
                    if (p.getPurchaseState() == Purchase.PurchaseState.PURCHASED) anyPurchased = true;
                }
            }
            ret.put("status", anyPurchased ? "purchased" : "pending");
            call.resolve(ret);
        } else if (code == BillingClient.BillingResponseCode.USER_CANCELED) {
            ret.put("status", "cancelled");
            call.resolve(ret);
        } else if (code == BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED) {
            ret.put("status", "already_owned");
            call.resolve(ret);
        } else {
            call.reject(describe(result), codeName(code));
        }
    }

    private void settleLaunchFailure(PluginCall call, BillingResult launch) {
        int code = launch.getResponseCode();
        if (code == BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED) {
            JSObject ret = new JSObject();
            ret.put("status", "already_owned");
            ret.put("purchases", new JSArray());
            call.resolve(ret);
        } else if (code == BillingClient.BillingResponseCode.USER_CANCELED) {
            JSObject ret = new JSObject();
            ret.put("status", "cancelled");
            ret.put("purchases", new JSArray());
            call.resolve(ret);
        } else {
            call.reject(describe(launch), codeName(code));
        }
    }

    /* ---------- JSON ---------- */

    private static JSObject productJson(ProductDetails d) {
        JSObject o = new JSObject();
        o.put("productId", d.getProductId());
        o.put("title", d.getName());
        ProductDetails.OneTimePurchaseOfferDetails offer = d.getOneTimePurchaseOfferDetails();
        if (offer != null) {
            o.put("price", offer.getFormattedPrice());
            o.put("priceMicros", offer.getPriceAmountMicros());
            o.put("currency", offer.getPriceCurrencyCode());
        }
        return o;
    }

    private static JSArray purchasesJson(List<Purchase> purchases) {
        JSArray arr = new JSArray();
        if (purchases == null) return arr;
        for (Purchase p : purchases) {
            JSObject o = new JSObject();
            o.put("purchaseToken", p.getPurchaseToken());
            o.put("orderId", p.getOrderId());
            o.put("acknowledged", p.isAcknowledged());
            o.put("state", p.getPurchaseState() == Purchase.PurchaseState.PURCHASED
                ? "purchased"
                : p.getPurchaseState() == Purchase.PurchaseState.PENDING ? "pending" : "unknown");
            JSArray ids = new JSArray();
            for (String id : p.getProducts()) ids.put(id);
            o.put("productIds", ids);
            arr.put(o);
        }
        return arr;
    }

    private static String describe(BillingResult r) {
        switch (r.getResponseCode()) {
            case BillingClient.BillingResponseCode.BILLING_UNAVAILABLE:
                return "Google Play purchases aren't available on this device. Please install the app from the Play Store and sign in to Google Play.";
            case BillingClient.BillingResponseCode.SERVICE_UNAVAILABLE:
            case BillingClient.BillingResponseCode.SERVICE_DISCONNECTED:
            case BillingClient.BillingResponseCode.NETWORK_ERROR:
                return "Couldn't reach Google Play. Please check your internet connection and try again.";
            case BillingClient.BillingResponseCode.ITEM_UNAVAILABLE:
                return "This item isn't available on Google Play yet.";
            default:
                String msg = r.getDebugMessage();
                return msg == null || msg.isEmpty() ? "Google Play purchase failed." : msg;
        }
    }

    private static String codeName(int code) {
        switch (code) {
            case BillingClient.BillingResponseCode.BILLING_UNAVAILABLE: return "BILLING_UNAVAILABLE";
            case BillingClient.BillingResponseCode.SERVICE_UNAVAILABLE: return "SERVICE_UNAVAILABLE";
            case BillingClient.BillingResponseCode.SERVICE_DISCONNECTED: return "SERVICE_DISCONNECTED";
            case BillingClient.BillingResponseCode.NETWORK_ERROR: return "NETWORK_ERROR";
            case BillingClient.BillingResponseCode.ITEM_UNAVAILABLE: return "ITEM_UNAVAILABLE";
            case BillingClient.BillingResponseCode.DEVELOPER_ERROR: return "DEVELOPER_ERROR";
            case BillingClient.BillingResponseCode.FEATURE_NOT_SUPPORTED: return "FEATURE_NOT_SUPPORTED";
            default: return "ERROR_" + code;
        }
    }
}
