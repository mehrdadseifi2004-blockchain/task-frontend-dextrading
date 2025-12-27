import { getTokenDescription, searchToken } from "@/services/http/token.http";
import { Metadata } from "next";
import TokenPage from "@/components/features/token/TokenPage";
import { formatNumberToSubscript } from "@/utils/PriceFormatter";
import TokenAccordion from "@/components/features/token/TokenAccordion";
import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import HowToUse from "@/components/features/followed-wallets/HowToUse";
import { TOKEN_PAGE_PARAMS } from "@/utils/pageParams";
import { minifyContract } from "@/utils/truncate";
import { parseHtmlToReact } from "@/utils/htmlParser";

interface Props {
  params: IParam;
  searchParams: searchParams;
}

type IParam = {
  params: [string, string];
};

type searchParams = {
  network: string;
};

/* -------------------- METADATA (بدون تغییر) -------------------- */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const data = await searchToken({
      params: {
        currencyAddress: params.params[1],
      },
    });

    const tokenData = data?.data?.[0];
    const tokenName = tokenData?.attributes?.name || "Unknown Token";
    const shortTokenName = tokenName.trim().split("/")[0];
    const tokenPrice = parseFloat(
      tokenData?.attributes?.base_token_price_usd || "0"
    ).toFixed(15);

    const dexPlatform =
      tokenData?.relationships?.dex?.data?.id || "unknown platform";
    const tokenId = tokenData?.id || "N/A";
    const blockchain = tokenId.split("_")[0] || "unknown blockchain";

    const pageUrl = `${process.env.NEXT_PUBLIC_BASE_URL_SEVEN}/tokens/${params.params[0]}/${params.params[1]}`;

    const priceChange24h =
      tokenData?.attributes?.price_change_percentage?.h24 || "0";
    const formattedPriceChange = parseFloat(priceChange24h).toFixed(2) + "%";

    let imageUrl =
      tokenData?.imageUrl2 ||
      `${process.env.NEXT_PUBLIC_BASE_URL_SEVEN}/Shot_Token.jpg`;

    if (imageUrl.startsWith("/")) {
      imageUrl = `${process.env.NEXT_PUBLIC_BASE_URL_SEVEN}${imageUrl}`;
    }

    const title = `${shortTokenName} Token | $${formatNumberToSubscript(
      +tokenPrice
    )} | ${blockchain} DEX Trading ${dexPlatform}`;

    const description = `${shortTokenName} on ${dexPlatform} (${blockchain}) is trading at $${tokenPrice} with a price change of ${formattedPriceChange}.`;

    return {
      title,
      description,
      alternates: {
        canonical: pageUrl,
      },
      openGraph: {
        title,
        description,
        url: pageUrl,
        images: [{ url: imageUrl }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch {
    return {
      title: "DEX Trading | Token Page",
      description: "Explore crypto token data and market analysis.",
    };
  }
}

/* -------------------- PAGE COMPONENT -------------------- */

export default async function Token({ params }: Props) {
  const searchedToken = await searchToken({
    params: {
      currencyAddress: params.params[1],
    },
  });

  const tokenDescription = await getTokenDescription(params.params[1]);

  const tokenHtmlContent = tokenDescription?.data?.data?.content;
  const parsedContent = tokenHtmlContent ? parseHtmlToReact(tokenHtmlContent) : null;

  return (
    <div>
      <Breadcrumb className="mt-12 mb-4">
        <BreadcrumbList>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
          <BreadcrumbLink
            href={`/tokens/${params.params[TOKEN_PAGE_PARAMS.NETWORK]}/${
              params.params[TOKEN_PAGE_PARAMS.CONTRACT_ADDRESS]
            }`}
          >
            {minifyContract(
              params.params[TOKEN_PAGE_PARAMS.CONTRACT_ADDRESS]
            )}
          </BreadcrumbLink>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-lg md:text-xl">
        $
        {searchedToken.data?.[0].attributes?.name
          ?.split("/")[0]
          .toUpperCase()}{" "}
        DEX – Live{" "}
        {params.params[TOKEN_PAGE_PARAMS.NETWORK].toUpperCase()} Market Data
      </h1>

      {parsedContent && (
        <article className="prose max-w-none" itemScope itemType="https://schema.org/Article">
          <h2 itemProp="headline">About this token</h2>
          <div itemProp="articleBody">
            {parsedContent}
          </div>
        </article>
      )}

      <TokenPage params={params} token={searchedToken} />

      {tokenHtmlContent && (
        <TokenAccordion
          tokenImageUrl={
            searchedToken.data?.[0].seoImageUrl ??
            `${process.env.NEXT_PUBLIC_BASE_URL_SEVEN}/Shot_Token.jpg`
          }
          tokenDescription={tokenHtmlContent}
        />
      )}

      <HowToUse />
    </div>
  );
}
