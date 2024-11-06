import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

export const TemplateDR = ({
  customerName,
  itemDesc,
  customerAddress,
  noOrder,
  shipDate,
  totalWeight,
  noSurat,
  note,
}: {
  customerName?: string;
  customerAddress?: string;
  noSurat?: string;
  noOrder?: string;
  shipDate?: string;
  totalWeight?: string;
  note?: string;
  itemDesc?: any[];
}) => (
  <Document>
    <Page style={styles.body}>
      <View style={styles.header} fixed>
        <Image
          style={{ width: 100, paddingVertical: 10 }}
          src={"/image/logo-sahara-bogatama-mid.png"}
        />
      </View>

      <Text style={styles.textAddress}>
        PT. Sahara Bogatama Indonesia{"\n"}Jl HM Idrus no 15a, Kelurahan
        Jatikramat,{"\n"}Kecamatan Jatiasih, Kota Bekasi,{"\n"}Jawa Barat,
        Indonesia
      </Text>

      <View style={{ marginVertical: 5, flexDirection: "row" }}>
        <View style={{ flex: 1 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.textCustomer}>{customerName}</Text>
          <Text style={styles.textCustomer}>{customerAddress}</Text>
        </View>
      </View>

      <View style={{ marginVertical: 10 }}>
        <Text style={styles.textNoSurat}>{noSurat}</Text>
      </View>

      <View style={{ marginTop: 5, flexDirection: "row" }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.textDetail}>Order:</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.textDetail}>Shipping Date:</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.textDetail}>Total Weight:</Text>
        </View>
      </View>

      <View style={{ marginBottom: 5, flexDirection: "row" }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.textDescDetail}>{noOrder}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.textDescDetail}>{shipDate}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.textDescDetail}>{totalWeight} KG</Text>
        </View>
      </View>

      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderTextLeft}>Item Description</Text>
        <Text style={styles.tableHeaderTextMiddle}>Qty</Text>
        <Text style={styles.tableHeaderTextEnd}>Satuan</Text>
      </View>
      {itemDesc?.map((o, idx) => (
        <View
          key={idx.toString()}
          style={{
            flexDirection: "row",
            borderColor: "#000000",
            borderBottomWidth: 1,
            borderLeftWidth: 1,
            borderRightWidth: 1,
            textAlign: "center",
            alignItems: "center",
            fontSize: 10,
          }}
        >
          <Text
            style={{
              flex: 1,
              borderRightColor: "#000000",
              borderRightWidth: 1,
              padding: 3,
            }}
          >
            {o.productName}
          </Text>
          <Text
            style={{
              width: "20%",
              borderRightColor: "#000000",
              borderRightWidth: 1,
              textAlign: "center",
              padding: 3,
            }}
          >
            {o.qty}
          </Text>
          <Text
            style={{
              width: "20%",
              borderRightColor: "#000000",
              textAlign: "center",
              padding: 3,
            }}
          >
            {o.unit}
          </Text>
        </View>
      ))}

      <Text style={{ fontSize: 14, marginTop: 10 }}>Note:</Text>

      <Text style={{ fontSize: 14, marginBottom: 10, textAlign: "justify" }}>
        {note}
      </Text>

      <Text style={{ fontSize: 14, marginVertical: 10, textAlign: "center" }}>
        DISETUJUI
      </Text>

      <View
        style={{
          marginVertical: 10,
          flexDirection: "row",
          justifyContent: "space-around",
        }}
      >
        <Text style={{ fontSize: 14 }}>Gudang</Text>
        <Text style={{ fontSize: 14 }}>Security</Text>
        <Text style={{ fontSize: 14 }}>Delivery</Text>
        <Text style={{ fontSize: 14 }}>Customer</Text>
      </View>

      <View style={styles.footer} fixed>
        <Text>NPWP: 765208616447000</Text>
        <Text>021-22107402 / 08119992180</Text>
        <Text>office@saharabogatama.co.id</Text>
        <Text>https://saharabogatama.co.id</Text>
      </View>
    </Page>
  </Document>
);

const styles = StyleSheet.create({
  body: { paddingTop: 25, paddingBottom: 65, paddingHorizontal: 35 },
  header: { borderBottomWidth: 2 },
  footer: {
    position: "absolute",
    fontSize: 10,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "grey",
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
  },
  textAddress: { fontSize: 14, marginVertical: 10 },
  textCustomer: { fontSize: 14, textAlign: "right" },
  textNoSurat: { fontSize: 18, fontFamily: "Helvetica-Bold" },
  textDetail: { fontSize: 14, fontFamily: "Helvetica-Bold" },
  textDescDetail: { fontSize: 14 },
  tableHeader: {
    flexDirection: "row",
    borderColor: "#000000",
    borderWidth: 1,
    alignItems: "center",
    height: 24,
    textAlign: "center",
    fontSize: 10,
    fontStyle: "bold",
    marginTop: 5,
  },
  tableHeaderTextLeft: {
    flex: 1,
    borderRightColor: "#000000",
    borderRightWidth: 1,
    padding: 3,
  },
  tableHeaderTextMiddle: {
    width: "20%",
    borderRightColor: "#000000",
    borderRightWidth: 1,
    padding: 3,
  },
  tableHeaderTextEnd: {
    width: "20%",
    borderRightColor: "#000000",
    padding: 3,
  },
});
