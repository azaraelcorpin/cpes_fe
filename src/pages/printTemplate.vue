<template>
  <q-page class="print-page">
    <section class="no-print page-controls" aria-label="Document actions">
      <div class="page-controls__content">
        <div>
          <div class="text-overline text-primary">Print preview</div>
          <div class="text-subtitle1 text-weight-medium">
            Review the document before printing
          </div>
        </div>
        <q-btn
          color="primary"
          icon="print"
          label="Print document"
          unelevated
          @click="printDocument"
        />
      </div>
    </section>

    <main class="print-canvas" aria-label="Subjective course evaluation form">
      <table class="print-document">
        <thead>
          <tr>
            <td>
              <header class="form-header">
                <div class="form-seal">
                  <img
                    src="~assets/MSU_Gensan_logo.png"
                    alt="Mindanao State University General Santos seal"
                  />
                </div>

                <div class="form-header-content">
                  <div class="institution-heading">
                    <h1>Mindanao State University - General Santos</h1>
                    <p>Fatima, General Santos City, 9500, Philippines</p>
                  </div>

                  <div class="metadata-row metadata-primary">
                    <div>SCE-MSU-GSC-CCSID</div>
                    <div class="form-name">SUBJECTIVE COURSE EVALUATION</div>
                    <div>Page 1 of 10</div>
                  </div>

                  <div class="metadata-row metadata-secondary">
                    <div>Revision No.: <span class="blank-field"></span></div>
                    <div>Effective Date: December 3, 2025</div>
                    <div>Document No.: 007</div>
                  </div>
                </div>
              </header>
            </td>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>
              <section class="document-body" aria-label="Course evaluation summary">
                <div class="course-details">
                  <div><strong>Semester and Academic Year:</strong> {{ semesterLabel }} {{ evaluation?.acad_year || '—' }}</div>
                  <div><strong>Course Code:</strong> {{ evaluation?.course_code || '—' }}</div>
                  <div><strong>Course Title:</strong> {{ evaluation?.course_title || '—' }}</div>
                  <div><strong>Course Coordinator:</strong> {{ courseCoordinator }}</div>
                </div>

                <p class="form-instructions">
                  <strong>Instructions:</strong> This SUBJECTIVE COURSE EVALUATION FORM is to be prepared and accomplished by each course adviser based on the results of the subjective course evaluation survey answered by all students in the class. The survey is conducted toward the end of the semester. The following scale shall be used:
                </p>

                <section class="rating-legend rating-legend-top" aria-label="Rating scale legend">
                  <strong>Rating Scale Legend:</strong>
                  <span v-if="ratingScaleLegend.length">
                    <span v-for="(scale, index) in ratingScaleLegend" :key="scale._id || scale.id || scale.range">
                      <template v-if="index"> | </template>{{ formatLegendEntry(scale) }}
                    </span>
                  </span>
                  <span v-else>No rating scale legend available.</span>
                </section>

                <table class="summary-table" aria-label="Subjective course evaluation summary report">
                  <caption>Subjective Course Evaluation Summary Report</caption>
                  <colgroup>
                    <col class="summary-label-column" />
                    <col class="summary-mean-column" />
                    <col class="summary-description-column" />
                    <col class="summary-interpretation-column" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th scope="col">Indicators</th>
                      <th scope="col">Mean</th>
                      <th scope="col">Description</th>
                      <th scope="col">Interpretation</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-for="(row, index) in summaryRows" :key="`${row.indicatorKey || 'indicator'}-${row.itemKey || 'row'}-${index}`">
                      <tr v-if="row.isHeader" class="summary-header-row">
                        <th colspan="4" scope="rowgroup">{{ row.label }}</th>
                      </tr>
                      <tr v-else-if="row.isOverallSpacer" class="summary-overall-spacer-row">
                        <td colspan="4"></td>
                      </tr>
                      <tr
                        v-else
                        :class="{
                          'summary-overall-footer-row': row.isOverallFooter,
                          'summary-total-average-row': row.label === 'Total Average'
                        }"
                      >
                        <th scope="row">{{ row.label }}</th>
                        <td>{{ formatMean(row.mean) }}</td>
                        <td>{{ row.description || '' }}</td>
                        <td>{{ row.interpretation || '' }}</td>
                      </tr>
                    </template>
                    <tr v-if="!summaryRows.length">
                      <td colspan="4" class="summary-empty">No response summary available.</td>
                    </tr>
                  </tbody>
                </table>

                <section class="rating-legend rating-legend-bottom" aria-label="Rating scale interpretation">
                  <strong>Interpretation:</strong>
                  <span v-if="ratingScaleLegend.length">
                    <span v-for="(scale, index) in ratingScaleLegend" :key="scale._id || scale.id || scale.range">
                      <template v-if="index"> | </template>{{ formatInterpretationEntry(scale) }}
                    </span>
                  </span>
                  <span v-else>No rating scale legend available.</span>
                </section>
              </section>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td><div class="footer-print-spacer">&nbsp;</div></td>
          </tr>
        </tfoot>

      </table>
      <footer class="form-footer absolute-page-footer" aria-label="Document approvals">
        <section class="approval-cell">
          <h2>Prepared by</h2>
          <div class="signature-space"></div>
        </section>
        <section class="approval-cell">
          <h2>Reviewed by</h2>
          <div class="signature-space"></div>
        </section>
        <section class="approval-cell">
          <h2>Approved by / Recommended by</h2>
          <div class="signature-space"></div>
        </section>
      </footer>
    </main>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  evaluation: {
    type: Object,
    default: () => ({})
  },
  summaryRows: {
    type: Array,
    default: () => []
  },
  ratingScaleLegend: {
    type: Array,
    default: () => []
  }
})

const courseCoordinator = computed(() => {
  const coordinator = (props.evaluation?.members || []).find(member =>
    String(member.role || '').trim().toUpperCase() === 'COORDINATOR'
  )

  return coordinator?.fullname || coordinator?.email || '—'
})

const semesterLabel = computed(() => {
  const semesters = {
    21: '1st Semester',
    22: '2nd Semester',
    23: 'Summer'
  }

  return semesters[props.evaluation?.sem] || '—'
})

function formatMean(value) {
  if (value === null || value === undefined || value === '') return '—'
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric.toFixed(2) : value
}

function formatLegendEntry(scale) {
  return `${scale.fixed_value}: ${scale.description}`
}

function formatInterpretationEntry(scale) {
  return `${scale.min_value}–${scale.max_value}: ${scale.interpretation}`
}

function printDocument() {
  window.print()
}
</script>

<style scoped>
.print-page {
  min-height: 100%;
  padding: 1px 20px 40px;
  background: #f3f5f8;
}

.page-controls {
  max-width: 850px;
  margin: 20px auto 16px;
}

.page-controls__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.print-canvas {
  box-sizing: border-box;
  max-width: 850px;
  margin: 20px auto;
  padding: 52px 60px;
  border: 1px solid #e1e5eb;
  background: #fff;
  box-shadow: 0 8px 28px rgb(22 34 51 / 10%);
  color: #202630;
}

.print-canvas {
  display: flex;
  min-height: 1123px;
  flex-direction: column;
}

.print-document {
  width: 100%;
  border-collapse: collapse;
}

.print-document > thead > tr > td,
.print-document > tbody > tr > td,
.print-document > tfoot > tr > td {
  padding: 0;
  vertical-align: bottom;
}

.form-header {
  display: grid;
  grid-template-columns: 102px minmax(0, 1fr);
  border: 1px solid #222;
  color: #111;
  font-family: Arial, sans-serif;
}

.form-seal {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-right: 1px solid #222;
}

.form-seal img {
  display: block;
  width: 76px;
  height: 76px;
  object-fit: contain;
}

.form-header-content {
  min-width: 0;
}

.institution-heading {
  position: relative;
  padding: 6px 8px 5px;
  text-align: center;
}

.institution-heading::after {
  position: absolute;
  left: 3%;
  right: 6%;
  bottom: -1px;
  height: 6px;
  background: #f2c51d;
  clip-path: polygon(0 35%, 78% 35%, 87% 0, 100% 0, 96% 75%, 78% 100%, 0 65%);
  content: '';
}

.institution-heading h1 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.15;
}

.institution-heading p {
  margin: 2px 0 0;
  font-size: 11px;
  line-height: 1.2;
}

.metadata-row {
  display: grid;
  grid-template-columns: 1.15fr 1.65fr 0.9fr;
  border-top: 1px solid #222;
  font-size: 9px;
  line-height: 1.2;
}

.metadata-row > div {
  display: flex;
  min-width: 0;
  align-items: center;
  padding: 5px 7px;
}

.metadata-row > div + div {
  justify-content: center;
  border-left: 1px solid #222;
  text-align: center;
}

.metadata-primary .form-name {
  font-size: 12px;
  font-weight: 700;
}

.metadata-secondary > div:last-child {
  justify-content: flex-start;
  text-align: left;
}

.blank-field {
  display: inline-block;
  min-width: 36px;
  margin-left: 3px;
  border-bottom: 1px solid #222;
}

.document-body {
  flex: 1 0 auto;
  padding: 18px 0;
  color: #111;
  font-family: Arial, sans-serif;
}

.course-details {
  margin-bottom: 14px;
  font-size: 11px;
  line-height: 1.4;
}

.form-instructions {
  margin: 0 0 10px;
  font-size: 10px;
  line-height: 1.35;
}

.rating-legend {
  font-size: 9px;
  font-style: italic;
  line-height: 1.35;
}

.rating-legend-top {
  margin-bottom: 12px;
}

.rating-legend-bottom {
  margin-top: 5px;
}

.summary-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 9px;
  line-height: 1.2;
}

.summary-table caption {
  padding: 5px;
  border: 1px solid #222;
  background: #222;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  text-align: center;
}

.summary-table th,
.summary-table td {
  padding: 3px 4px;
  border: 1px solid #222;
  overflow-wrap: anywhere;
  text-align: left;
  vertical-align: top;
}

.summary-table thead th {
  font-weight: 700;
}

.summary-label-column {
  width: 55%;
}

.summary-mean-column {
  width: 9%;
}

.summary-description-column {
  width: 18%;
}

.summary-interpretation-column {
  width: 18%;
}

.summary-header-row {
  background: #f0f0f0;
  font-weight: 700;
}

.summary-overall-footer-row,
.summary-total-average-row {
  font-weight: 700;
}

.summary-overall-spacer-row td {
  height: 5px;
  padding: 0;
}

.summary-empty {
  text-align: center !important;
}

.form-footer {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border: 1px solid #222;
  color: #111;
  font-family: Arial, sans-serif;
}

.approval-cell + .approval-cell {
  border-left: 1px solid #222;
}

.approval-cell h2 {
  min-height: 25px;
  margin: 0;
  padding: 5px 6px;
  border-bottom: 1px solid #222;
  font-size: 10px;
  font-weight: 700;
  line-height: 1.3;
  text-align: center;
}

.signature-space {
  min-height: 56px;
}

@media screen {
  .print-canvas {
    max-width: 850px;
    margin: 20px auto;
    padding: 36px 40px;
    border: 1px solid #e1e5eb;
    background: #fff;
    box-shadow: 0 8px 28px rgb(22 34 51 / 10%);
  }

  .footer-print-spacer {
    display: none;
  }
}

@media screen and (max-width: 600px) {
  .print-page {
    padding-right: 12px;
    padding-left: 12px;
  }

  .page-controls__content {
    align-items: flex-start;
  }

  .page-controls .q-btn {
    flex-shrink: 0;
  }

  .print-canvas {
    min-height: 900px;
    margin: 12px auto;
    padding: 20px 14px;
  }

  .form-header {
    grid-template-columns: 66px minmax(0, 1fr);
  }

  .form-seal {
    padding: 4px;
  }

  .form-seal img {
    width: 54px;
    height: 54px;
  }

  .institution-heading h1 {
    font-size: 13px;
  }

  .institution-heading p,
  .metadata-row {
    font-size: 8px;
  }

  .metadata-row {
    grid-template-columns: 1fr 1.3fr 0.8fr;
  }

  .metadata-row > div {
    padding: 4px 3px;
  }

  .metadata-primary .form-name {
    font-size: 9px;
  }

  .metadata-secondary > div {
    flex-wrap: wrap;
  }

  .approval-cell h2 {
    padding: 4px 2px;
    font-size: 8px;
  }
}

@page {
  size: A4 portrait;
  margin: 15mm 15mm 15mm;
}

@media print {
  :global(body *) {
    visibility: hidden !important;
  }

  :global(body *:has(.print-page)) {
    display: contents !important;
  }

  :global(body *:has(.print-page) > :not(.print-page):not(:has(.print-page))) {
    display: none !important;
  }

  .print-page,
  .print-page * {
    visibility: visible !important;
  }

  :global(html),
  :global(body),
  :global(.q-layout),
  :global(.q-page-container),
  :global(.q-page) {
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: visible !important;
    background: transparent !important;
    box-shadow: none !important;
  }

  :global(body),
  :global(.q-layout),
  :global(.q-page-container),
  :global(.q-page),
  .print-canvas,
  .print-canvas * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  :global(.no-print),
  :global(.q-header),
  :global(.q-footer),
  :global(.q-drawer) {
    display: none !important;
  }

  .print-page {
    display: block !important;
    position: static !important;
    width: 100% !important;
  }

  .print-canvas {
    display: block !important;
    width: 100% !important;
    max-width: none !important;
    min-height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    border: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
  }

  .print-document {
    display: table !important;
    width: 100% !important;
    border-collapse: collapse !important;
  }

  .print-document > thead {
    display: table-header-group !important;
  }

  .print-document > tbody {
    display: table-row-group !important;
  }

  .print-document > tfoot {
    display: table-footer-group !important;
  }

  .print-document > thead > tr {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .print-document > tbody > tr {
    page-break-inside: auto;
    break-inside: auto;
  }

  .print-document > thead > tr > td,
  .print-document > tfoot > tr > td {
    padding: 0 !important;
  }

  .print-document > tbody > tr > td {
    padding: 12px 0 0 !important;
    vertical-align: top !important;
  }

  .absolute-page-footer {
    position: fixed !important;
    bottom: 0mm;
    left: 0 !important;
    width: 100% !important;
    background: white !important;
    height: 25mm;
    box-sizing: border-box;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .footer-print-spacer {
    height: 25mm;
    display: block !important;
  }

  .document-body {
    padding: 0 0 10px;
  }

  .summary-table {
    break-inside: auto;
    page-break-inside: auto;
  }

  .summary-table thead {
    display: table-header-group;
  }

  .summary-table tr {
    break-inside: avoid;
    page-break-inside: avoid;
  }
}
</style>