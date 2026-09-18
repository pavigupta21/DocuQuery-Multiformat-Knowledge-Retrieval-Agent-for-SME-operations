from io import BytesIO

import pandas as pd


def extract_text_from_excel(file_bytes: bytes) -> str:
    excel_file = BytesIO(file_bytes)

    sheets = pd.read_excel(
        excel_file,
        sheet_name=None,
    )

    extracted_text = []

    for sheet_name, dataframe in sheets.items():
        extracted_text.append(f"Sheet: {sheet_name}")

        for _, row in dataframe.iterrows():
            row_text = " | ".join(
                f"{column}: {value}"
                for column, value in row.items()
                if pd.notna(value)
            )

            if row_text:
                extracted_text.append(row_text)

    return "\n".join(extracted_text).strip()