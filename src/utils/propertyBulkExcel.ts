import ExcelJS from "exceljs";

interface DropdownItem {
  _id?: string;
  name?: string;
}

interface PropertyDropdownData {
  propertyActions: DropdownItem[];
  propertyTypes: DropdownItem[];
  bhks: DropdownItem[];
  lifestyles: DropdownItem[];
  amenities: DropdownItem[];
}

export const downloadPropertyDemoExcel = async ({
  propertyActions,
  propertyTypes,
  bhks,
  lifestyles,
  amenities,
}: PropertyDropdownData) => {
  const workbook = new ExcelJS.Workbook();

  const worksheet = workbook.addWorksheet("Properties");
  const dropdownSheet = workbook.addWorksheet("Dropdown Options");

  const headers = [
    "name",
    "ownerEmail",
    "propertyType",
    "propertyAction",
    "bhk",
    "furnished",
    "totalSquareFeet",
    "totalBuiltArea",
    "totalPrice",
    "description",
    "houseNo",
    "street",
    "landmark",
    "locality",
    "city",
    "state",
    "pincode",
    "country",
    "latitude",
    "longitude",
    "isFeatured",
    "isRecommended",
    "isHighlighted",
    "lifestyles",
    "premiumAmenities",
    "units",
    "location",
  ];

  worksheet.addRow(headers);

  worksheet.addRow([
    "Green Villa",
    "owner@example.com",
    propertyTypes[0]?.name ?? "",
    propertyActions[0]?.name ?? "",
    bhks[0]?.name ?? "",
    "Furnished",
    1800,
    1650,
    12500000,
    "Beautiful property",
    "12A",
    "Anna Nagar Main Road",
    "Near Metro Station",
    "Anna Nagar",
    "Chennai",
    "Tamil Nadu",
    "600040",
    "India",
    13.0827,
    80.2707,
    "true",
    "false",
    "true",
    lifestyles[0]?.name ?? "",
    amenities[0]?.name ?? "",
    "sq.ft",
    JSON.stringify({
      type: "Point",
      coordinates: [80.2707, 13.0827],
    }),
  ]);

  dropdownSheet.getCell("A1").value = "Property Types";
  dropdownSheet.getCell("B1").value = "Property Actions";
  dropdownSheet.getCell("C1").value = "BHK";
  dropdownSheet.getCell("D1").value = "Lifestyle";
  dropdownSheet.getCell("E1").value = "Premium Amenities";
  dropdownSheet.getCell("F1").value = "Units";
  dropdownSheet.getCell("G1").value = "Furnished";
  dropdownSheet.getCell("H1").value = "Boolean";

  const units = ["sq.ft", "sq.km", "sq.m", "acre", "hectare"];

  const furnishedOptions = ["Furnished", "Semi-Furnished", "Unfurnished"];

  const booleanOptions = ["true", "false"];

  const maxLength = Math.max(
    propertyTypes.length,
    propertyActions.length,
    bhks.length,
    lifestyles.length,
    amenities.length,
    units.length,
    furnishedOptions.length,
    booleanOptions.length,
  );

  for (let i = 0; i < maxLength; i++) {
    dropdownSheet.getCell(`A${i + 2}`).value = propertyTypes[i]?.name ?? "";

    dropdownSheet.getCell(`B${i + 2}`).value = propertyActions[i]?.name ?? "";

    dropdownSheet.getCell(`C${i + 2}`).value = bhks[i]?.name ?? "";

    dropdownSheet.getCell(`D${i + 2}`).value = lifestyles[i]?.name ?? "";

    dropdownSheet.getCell(`E${i + 2}`).value = amenities[i]?.name ?? "";

    dropdownSheet.getCell(`F${i + 2}`).value = units[i] ?? "";

    dropdownSheet.getCell(`G${i + 2}`).value = furnishedOptions[i] ?? "";

    dropdownSheet.getCell(`H${i + 2}`).value = booleanOptions[i] ?? "";
  }

  worksheet.getRow(1).font = {
    bold: true,
  };

  dropdownSheet.getRow(1).font = {
    bold: true,
  };

  for (let row = 2; row <= 500; row++) {
    if (propertyTypes.length > 0) {
      worksheet.getCell(`C${row}`).dataValidation = {
        type: "list",
        allowBlank: false,
        formulae: [`'Dropdown Options'!$A$2:$A$${propertyTypes.length + 1}`],
      };
    }

    if (propertyActions.length > 0) {
      worksheet.getCell(`D${row}`).dataValidation = {
        type: "list",
        allowBlank: false,
        formulae: [`'Dropdown Options'!$B$2:$B$${propertyActions.length + 1}`],
      };
    }

    if (bhks.length > 0) {
      worksheet.getCell(`E${row}`).dataValidation = {
        type: "list",
        allowBlank: false,
        formulae: [`'Dropdown Options'!$C$2:$C$${bhks.length + 1}`],
      };
    }

    worksheet.getCell(`F${row}`).dataValidation = {
      type: "list",
      allowBlank: false,
      formulae: [`'Dropdown Options'!$G$2:$G$${furnishedOptions.length + 1}`],
    };

    worksheet.getCell(`U${row}`).dataValidation = {
      type: "list",
      allowBlank: false,
      formulae: [`'Dropdown Options'!$H$2:$H$3`],
    };

    worksheet.getCell(`V${row}`).dataValidation = {
      type: "list",
      allowBlank: false,
      formulae: [`'Dropdown Options'!$H$2:$H$3`],
    };

    worksheet.getCell(`W${row}`).dataValidation = {
      type: "list",
      allowBlank: false,
      formulae: [`'Dropdown Options'!$H$2:$H$3`],
    };

    if (lifestyles.length > 0) {
      worksheet.getCell(`X${row}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [`'Dropdown Options'!$D$2:$D$${lifestyles.length + 1}`],
      };
    }

    if (amenities.length > 0) {
      worksheet.getCell(`Y${row}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [`'Dropdown Options'!$E$2:$E$${amenities.length + 1}`],
      };
    }

    worksheet.getCell(`Z${row}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: [`'Dropdown Options'!$F$2:$F$${units.length + 1}`],
    };
  }

  worksheet.columns = [
    { width: 25 },
    { width: 30 },
    { width: 25 },
    { width: 25 },
    { width: 15 },
    { width: 20 },
    { width: 20 },
    { width: 20 },
    { width: 20 },
    { width: 35 },
    { width: 15 },
    { width: 25 },
    { width: 25 },
    { width: 25 },
    { width: 20 },
    { width: 20 },
    { width: 15 },
    { width: 15 },
    { width: 15 },
    { width: 15 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 25 },
    { width: 30 },
    { width: 15 },
    { width: 45 },
  ];

  dropdownSheet.columns = [
    { width: 25 },
    { width: 25 },
    { width: 20 },
    { width: 25 },
    { width: 30 },
    { width: 15 },
    { width: 25 },
    { width: 15 },
  ];

  worksheet.views = [
    {
      state: "frozen",
      ySplit: 1,
    },
  ];

  dropdownSheet.views = [
    {
      state: "frozen",
      ySplit: 1,
    },
  ];

  const buffer = await workbook.xlsx.writeBuffer();

  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = "property-bulk-upload-demo.xlsx";

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};
