import path from "path";
import { Document, Page, View, Text, Image, Font, StyleSheet } from "@react-pdf/renderer";

const FONTS_DIR = path.join(process.cwd(), "src", "server", "pdf", "fonts");

let fontsRegistered = false;

// Hebrew/RTL text renders as individual glyphs in the order given — PDF
// text runs aren't bidi-aware the way a browser is — so callers should keep
// Hebrew fields short (names, single-line descriptions) rather than long
// wrapped paragraphs, where visual character order would look wrong.
// Registering separate Hebrew/Latin unicode ranges under one family lets a
// single Text node mix Hebrew, Latin letters, and digits (e.g. an order id)
// without the caller having to split the string themselves.
function registerFonts() {
  if (fontsRegistered) return;
  // Must be a single font file covering both scripts per weight — Google's
  // per-script-subset webfont files (the usual choice for a browser
  // <link>, one file per unicode-range) don't work here: react-pdf/fontkit
  // has no CSS-style unicode-range fallback, so with Hebrew and Latin split
  // across two "fontWeight: 400" sources it silently picks one file for
  // every glyph and renders the other script as mojibake. These two files
  // are static (non-variable) instances cut from the full multi-script
  // Rubik variable font at wght=400/700, each containing every glyph the
  // brief actually needs.
  Font.register({
    family: "Rubik",
    fonts: [
      { src: path.join(FONTS_DIR, "rubik-400-static.ttf"), fontWeight: 400 },
      { src: path.join(FONTS_DIR, "rubik-700-static.ttf"), fontWeight: 700 },
    ],
  });
  // react-pdf can't automatically hyphenate/break Hebrew words the way it
  // does Latin ones — disable hyphenation globally so long Hebrew words
  // don't get split mid-word at the line wrap.
  Font.registerHyphenationCallback((word) => [word]);
  fontsRegistered = true;
}

const styles = StyleSheet.create({
  page: {
    fontFamily: "Rubik",
    fontSize: 10,
    padding: 36,
    color: "#1d1812",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: "#ddaa5d",
    paddingBottom: 12,
    marginBottom: 16,
  },
  brand: { fontSize: 16, fontWeight: 700, letterSpacing: 1 },
  brandSub: { fontSize: 8, color: "#8a7a63", marginTop: 2 },
  docTitle: { fontSize: 12, fontWeight: 700, textAlign: "right" },
  docMeta: { fontSize: 8, color: "#8a7a63", textAlign: "right", marginTop: 2 },
  section: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: "#8a7a63",
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { width: 110, color: "#8a7a63" },
  value: { flex: 1, fontWeight: 700 },
  paragraph: { lineHeight: 1.5 },

  // 2x2 CAD viewport grid — mirrors the jeweler's own CAD software layout
  // (Perspective / Front / Top / Right) rather than a single arbitrary
  // render, so the factory sees the piece from every angle at once.
  cadGrid: { flexDirection: "row", flexWrap: "wrap", borderWidth: 1, borderColor: "#ddaa5d" },
  cadCell: { width: "50%", aspectRatio: 1.6, borderColor: "#ddaa5d", borderWidth: 0.5, position: "relative" },
  cadImage: { width: "100%", height: "100%", objectFit: "cover" },
  cadLabel: {
    position: "absolute",
    bottom: 4,
    left: 6,
    fontSize: 7,
    color: "#8a7a63",
    backgroundColor: "#fbf8f2",
    paddingHorizontal: 4,
    paddingVertical: 1,
  },

  imagesRow: { flexDirection: "row", gap: 12, marginTop: 4 },
  imageBox: { flex: 1, alignItems: "center" },
  image: { width: "100%", height: 160, objectFit: "cover", borderWidth: 1, borderColor: "#ddaa5d" },
  imageCaption: { fontSize: 8, color: "#8a7a63", marginTop: 4, textAlign: "center" },

  table: { borderWidth: 1, borderColor: "#e5ddc9" },
  tableHeadRow: { flexDirection: "row", backgroundColor: "#f7f2e7" },
  tableRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#e5ddc9" },
  tableTotalRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#ddaa5d",
    backgroundColor: "#f7f2e7",
  },
  th: { flex: 1, padding: 5, fontSize: 8, fontWeight: 700, color: "#8a7a63" },
  td: { flex: 1, padding: 5, fontSize: 9 },

  notes: {
    borderWidth: 1,
    borderColor: "#e5ddc9",
    backgroundColor: "#f7f2e7",
    padding: 10,
    lineHeight: 1.5,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    fontSize: 7,
    color: "#a89a80",
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#e5ddc9",
    paddingTop: 8,
  },
});

const JEWELRY_TYPE_LABEL: Record<string, string> = {
  RING: "Ring / טבעת",
  NECKLACE: "Necklace / שרשרת",
  BRACELET: "Bracelet / צמיד",
  EARRINGS: "Earrings / עגילים",
  OTHER: "Other / אחר",
};

export type CustomDesignBriefData = {
  id: string;
  createdAt: Date;
  jewelryType: string;
  description: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  adminNotes: string | null;
  inspirationImageAbsPath: string | null;
  sketchImageAbsPath: string | null;
  generatedImageAbsPath: string | null;
  modelNumber: string | null;
  metalType: string | null;
  metalWeightGrams: number | null;
  metalWeightDwt: number | null;
  cadViews: { label: string; absPath: string }[];
  gems: { shape: string; dimensionsMm: string; count: number; caratWeight: number }[];
};

export function CustomDesignBrief({ data }: { data: CustomDesignBriefData }) {
  registerFonts();

  const fallbackImages: { path: string; caption: string }[] = [];
  if (data.generatedImageAbsPath) fallbackImages.push({ path: data.generatedImageAbsPath, caption: "Design Preview" });
  if (data.inspirationImageAbsPath) fallbackImages.push({ path: data.inspirationImageAbsPath, caption: "Inspiration" });
  if (data.sketchImageAbsPath) fallbackImages.push({ path: data.sketchImageAbsPath, caption: "Customer Sketch" });

  const hasCadViews = data.cadViews.length > 0;
  const hasMetalSpec = data.metalType || data.metalWeightGrams != null || data.metalWeightDwt != null;
  const totalGemCount = data.gems.reduce((sum, g) => sum + g.count, 0);
  const totalGemWeight = data.gems.reduce((sum, g) => sum + g.caratWeight, 0);

  return (
    <Document title={`Custom Design Brief — ${data.id}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>LADY DIAMOND</Text>
            <Text style={styles.brandSub}>Since 2010 — ladydiamondjewels.com</Text>
          </View>
          <View>
            <Text style={styles.docTitle}>Casting Brief</Text>
            <Text style={styles.docMeta}>Request #{data.id.slice(-8).toUpperCase()}</Text>
            {data.modelNumber && <Text style={styles.docMeta}>Model {data.modelNumber}</Text>}
            <Text style={styles.docMeta}>{data.createdAt.toISOString().slice(0, 10)}</Text>
          </View>
        </View>

        {hasCadViews && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CAD Views</Text>
            <View style={styles.cadGrid}>
              {data.cadViews.map((v) => (
                <View key={v.label} style={styles.cadCell}>
                  {/* eslint-disable-next-line jsx-a11y/alt-text -- this is @react-pdf/renderer's Image, not an HTML <img> */}
                  <Image src={v.absPath} style={styles.cadImage} />
                  <Text style={styles.cadLabel}>{v.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Jewelry Type</Text>
            <Text style={styles.value}>{JEWELRY_TYPE_LABEL[data.jewelryType] ?? data.jewelryType}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Customer</Text>
            <Text style={styles.value}>{data.customerName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{data.customerEmail}</Text>
          </View>
          {data.customerPhone && (
            <View style={styles.row}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>{data.customerPhone}</Text>
            </View>
          )}
        </View>

        {hasMetalSpec && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Metal Weight</Text>
            <View style={styles.table}>
              <View style={styles.tableHeadRow}>
                <Text style={styles.th}>Metal</Text>
                <Text style={styles.th}>Grams</Text>
                <Text style={styles.th}>DWT</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.td}>{data.metalType ?? "—"}</Text>
                <Text style={styles.td}>{data.metalWeightGrams != null ? data.metalWeightGrams.toFixed(2) : "—"}</Text>
                <Text style={styles.td}>{data.metalWeightDwt != null ? data.metalWeightDwt.toFixed(2) : "—"}</Text>
              </View>
            </View>
          </View>
        )}

        {data.gems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gem Report</Text>
            <View style={styles.table}>
              <View style={styles.tableHeadRow}>
                <Text style={styles.th}>Shape</Text>
                <Text style={styles.th}>Dimensions (mm)</Text>
                <Text style={styles.th}>Count</Text>
                <Text style={styles.th}>Carat Weight</Text>
              </View>
              {data.gems.map((g, i) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={styles.td}>{g.shape}</Text>
                  <Text style={styles.td}>{g.dimensionsMm || "—"}</Text>
                  <Text style={styles.td}>{g.count}</Text>
                  <Text style={styles.td}>{g.caratWeight.toFixed(2)} ct</Text>
                </View>
              ))}
              <View style={styles.tableTotalRow}>
                <Text style={[styles.td, { fontWeight: 700 }]}>Total</Text>
                <Text style={styles.td} />
                <Text style={[styles.td, { fontWeight: 700 }]}>{totalGemCount}</Text>
                <Text style={[styles.td, { fontWeight: 700 }]}>{totalGemWeight.toFixed(2)} ct tw</Text>
              </View>
            </View>
          </View>
        )}

        {data.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Description</Text>
            <Text style={styles.paragraph}>{data.description}</Text>
          </View>
        )}

        {!hasCadViews && fallbackImages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reference Images</Text>
            <View style={styles.imagesRow}>
              {fallbackImages.map((img) => (
                <View key={img.path} style={styles.imageBox}>
                  {/* eslint-disable-next-line jsx-a11y/alt-text -- this is @react-pdf/renderer's Image, not an HTML <img> */}
                  <Image src={img.path} style={styles.image} />
                  <Text style={styles.imageCaption}>{img.caption}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {data.adminNotes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Internal Notes for Manufacturer</Text>
            <Text style={[styles.notes, styles.paragraph]}>{data.adminNotes}</Text>
          </View>
        )}

        <Text style={styles.footer}>
          Prepared by Lady Diamond Jewels for casting/production purposes only — not a customer-facing document.
        </Text>
      </Page>
    </Document>
  );
}
