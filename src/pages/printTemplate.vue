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
          :loading="isPreparingPrint"
          :disable="isPreparingPrint"
          @click="printDocument"
        />
      </div>
      <div v-if="printError" class="text-negative q-mt-sm" role="alert">
        {{ printError }}
      </div>
    </section>

    <main class="preview-pages" aria-label="Paginated document preview">
      <article
        v-for="page in previewPages"
        :key="page.number"
        ref="previewSheetElements"
        class="preview-sheet"
        :aria-label="`Document page ${page.number} of ${previewPages.length}`"
      >
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
              <div>Page {{ page.number }} of {{ previewPages.length }}</div>
            </div>
            <div class="metadata-row metadata-secondary">
              <div>Revision No.: <span class="blank-field"></span></div>
              <div>Effective Date: December 3, 2025</div>
              <div>Document No.: 007</div>
            </div>
          </div>
        </header>

        <section class="preview-document-body">
          <template v-if="page.showIntro">
            <div class="course-details">
              <div><strong>Semester and Academic Year:</strong> {{ semesterLabel }} {{ evaluation?.acad_year || '—' }}</div>
              <div><strong>Course Code:</strong> {{ evaluation?.course_code || '—' }}</div>
              <div><strong>Course Title:</strong> {{ evaluation?.course_title || '—' }}</div>
              <div><strong>Course Coordinator:</strong> {{ courseCoordinator }}</div>
            </div>

            <p class="form-instructions">
              <strong>Instructions:</strong> This SUBJECTIVE COURSE EVALUATION FORM is to be prepared and accomplished by each course coordinator based on the results of the subjective course evaluation survey answered by all students in the class. The survey is conducted toward the end of the semester. The following scale shall be used:
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
          </template>

          <table v-if="page.showSummaryTable" class="summary-table" aria-label="Subjective course evaluation summary report">
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
              <template v-for="(row, index) in page.summaryRows" :key="`${row.indicatorKey || 'indicator'}-${row.itemKey || 'row'}-${index}`">
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
              <tr v-if="page.showSummaryEmpty">
                <td colspan="4" class="summary-empty">No response summary available.</td>
              </tr>
            </tbody>
          </table>

          <section v-if="page.showInterpretation" class="rating-legend rating-legend-bottom" aria-label="Rating scale interpretation">
            <strong>Interpretation:</strong>
            <span v-if="ratingScaleLegend.length">
              <span v-for="(scale, index) in ratingScaleLegend" :key="scale._id || scale.id || scale.range">
                <template v-if="index"> | </template>{{ formatInterpretationEntry(scale) }}
              </span>
            </span>
            <span v-else>No rating scale legend available.</span>
          </section>

          <table v-if="page.showActionReport" class="action-report-table" aria-label="Subjective course evaluation action report">
            <thead>
              <tr>
                <th colspan="2">Subjective Course Evaluation Action Report</th>
              </tr>
              <tr>
                <th scope="col">Remarks</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(row, index) in page.actionRows" :key="row.id || `${row.name}-${index}`">
                <tr class="action-report-indicator">
                  <th colspan="2" scope="rowgroup">{{ romanNumeral(row.index + 1) }}. {{ row.name }}</th>
                </tr>
                <tr class="action-report-details">
                  <td>
                    <strong>Significantly Lowest Rated Item/s:</strong>
                    <div v-if="row.items.length">
                      <div v-for="(item, itemIndex) in row.items" :key="`${row.id || index}-item-${itemIndex}`">
                        - {{ item }}
                      </div>
                    </div>
                    <div v-else>- None</div>
                    <div class="action-report-comments">
                      <strong>Student Comments and Suggestions:</strong>
                      <div v-if="row.comments.length">
                        <div v-for="(comment, commentIndex) in row.comments" :key="`${row.id || index}-comment-${commentIndex}`">
                          - {{ comment }}
                        </div>
                      </div>
                      <div v-else>- None</div>
                    </div>
                  </td>
                  <td>{{ row.action || '—' }}</td>
                </tr>
              </template>
              <tr v-if="page.showActionReportEmpty">
                <td colspan="2" class="action-report-empty">No action report data available.</td>
              </tr>
            </tbody>
          </table>

          <section
            v-if="page.showSignatories"
            class="action-report-signatories"
            aria-label="Action report signatories"
          >
            <div
              v-for="signatory in latestActionReportSignatories"
              :key="signatory.status"
              class="action-report-signatory"
            >
              <strong>{{ signatory.label }}:</strong>
              <span v-if="signatory.entry" class="action-report-signatory-meta">
                <span>{{ signatory.entry.email }}</span>
                <span>{{ formatSignatoryTimestamp(signatory.entry.acted_at) }}</span>
                <span>({{ signatory.entry.role }})</span>
              </span>
            </div>
          </section>
        </section>

        <footer class="form-footer preview-page-footer" aria-label="Document approvals">
          <section class="approval-cell">
            <h2>Prepared by</h2>
            <div class="signature-space">
              <strong>MICHAEL B. CANAWAY, PhD</strong>
              <span>Process Owner</span>
            </div>
          </section>
          <section class="approval-cell">
            <h2>Reviewed by</h2>
            <div class="signature-space">
              <strong>PROF. MONSOUR A. PELMIN, PhD</strong>
              <span>QuAMSO Director</span>
            </div>
          </section>
          <section class="approval-cell">
            <h2>Approved by</h2>
            <div class="signature-space">
              <strong>ATTY. SHIDIK T. ABANTAS, MDM, LLM</strong>
              <span>University Chancellor</span>
            </div>
          </section>
        </footer>
      </article>
    </main>

    <main v-if="printImageSources.length" class="print-image-pages" aria-hidden="true">
      <img
        v-for="(source, index) in printImageSources"
        :key="index"
        class="print-page-image"
        :src="source"
        alt=""
      />
    </main>

    <main class="print-canvas print-source" aria-label="Subjective course evaluation form">
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
                  <strong>Instructions:</strong> This SUBJECTIVE COURSE EVALUATION FORM is to be prepared and accomplished by each course coordinator based on the results of the subjective course evaluation survey answered by all students in the class. The survey is conducted toward the end of the semester. The following scale shall be used:
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

                <table class="action-report-table" aria-label="Subjective course evaluation action report">
                  <thead>
                    <tr>
                      <th colspan="2">Subjective Course Evaluation Action Report</th>
                    </tr>
                    <tr>
                      <th scope="col">Remarks</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-for="(row, index) in actionReportRows" :key="row.id || `${row.name}-${index}`">
                      <tr class="action-report-indicator">
                        <th colspan="2" scope="rowgroup">{{ romanNumeral(index + 1) }}. {{ row.name }}</th>
                      </tr>
                      <tr class="action-report-details">
                        <td>
                          <strong>Significantly Lowest Rated Item/s:</strong>
                          <div v-if="row.items.length">
                            <div v-for="(item, itemIndex) in row.items" :key="`${row.id || index}-item-${itemIndex}`">
                              - {{ item }}
                            </div>
                          </div>
                          <div v-else>- None</div>
                          <div class="action-report-comments">
                            <strong>Student Comments and Suggestions:</strong>
                            <div v-if="row.comments.length">
                              <div v-for="(comment, commentIndex) in row.comments" :key="`${row.id || index}-comment-${commentIndex}`">
                                - {{ comment }}
                              </div>
                            </div>
                            <div v-else>- None</div>
                          </div>
                        </td>
                        <td>{{ row.action || '—' }}</td>
                      </tr>
                    </template>
                    <tr v-if="!actionReportRows.length">
                      <td colspan="2" class="action-report-empty">No action report data available.</td>
                    </tr>
                  </tbody>
                </table>
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
          <div class="signature-space">
            <strong>MICHAEL B. CANAWAY, PhD</strong>
            <span>Process Owner</span>
          </div>
        </section>
        <section class="approval-cell">
          <h2>Reviewed by</h2>
          <div class="signature-space">
            <strong>PROF. MONSOUR A. PELMIN, PhD</strong>
            <span>QuAMSO Director</span>
          </div>
        </section>
        <section class="approval-cell">
          <h2>Approved by</h2>
          <div class="signature-space">
            <strong>ATTY. SHIDIK T. ABANTAS, MDM, LLM</strong>
            <span>University Chancellor</span>
          </div>
        </section>
      </footer>
    </main>
  </q-page>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import html2canvas from 'html2canvas'

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
  },
  actionReportRows: {
    type: Array,
    default: () => []
  },
  approvalHistory: {
    type: Array,
    default: () => []
  }
})

const previewSheetElements = ref([])
const printImageSources = ref([])
const isPreparingPrint = ref(false)
const printError = ref('')
let printImageObjectUrls = []

onBeforeUnmount(() => {
  printImageObjectUrls.forEach(url => URL.revokeObjectURL(url))
})

const latestActionReportSignatories = computed(() => {
  const sortedItems = props.approvalHistory
    .filter(item => item && typeof item === 'object')
    .map((item, index) => ({ ...item, _originalIndex: index }))
    .sort((first, second) => {
      const firstTime = first.acted_at ? new Date(first.acted_at).getTime() : Number.NaN
      const secondTime = second.acted_at ? new Date(second.acted_at).getTime() : Number.NaN
      const firstValid = Number.isFinite(firstTime)
      const secondValid = Number.isFinite(secondTime)

      if (!firstValid && !secondValid) return first._originalIndex - second._originalIndex
      if (!firstValid) return 1
      if (!secondValid) return -1
      return firstTime - secondTime || first._originalIndex - second._originalIndex
    })

  const rounds = []
  let currentRound = null
  for (const item of sortedItems) {
    const status = String(item.status || '').trim().toUpperCase()
    if (!status) continue

    if (!currentRound || (status === 'SUBMITTED' && currentRound.length > 0)) {
      currentRound = []
      rounds.push(currentRound)
    }

    currentRound.push({ ...item, status })
  }

  const latestRound = rounds[rounds.length - 1] || []
  const roles = [
    { status: 'SUBMITTED', label: 'Prepared by' },
    { status: 'REVIEWED', label: 'Reviewed by' },
    { status: 'ENDORSED', label: 'Endorsed by' },
    { status: 'CHECKED', label: 'Checked by' },
    { status: 'APPROVED', label: 'Approved by' }
  ]

  return roles.map(role => ({
    ...role,
    entry: latestRound.filter(item => item.status === role.status).slice(-1)[0] || null
  }))
})

const previewPages = computed(() => {
  const pageCapacity = 740
  const signatoriesHeight = 180
  const pages = []
  let page = createPage(true)
  page.usedHeight = estimateIntroHeight()

  const startPage = () => {
    pages.push(page)
    page = createPage(false)
  }
  const addSummaryTable = () => {
    page.showSummaryTable = true
    page.usedHeight += 40
  }

  if (props.summaryRows.length) {
    addSummaryTable()
    for (const row of props.summaryRows) {
      const height = estimateSummaryRowHeight(row)
      if (page.usedHeight + height > pageCapacity && (page.summaryRows.length || page.showIntro)) {
        startPage()
        addSummaryTable()
      }
      page.summaryRows.push(row)
      page.usedHeight += height
    }
  } else {
    page.showSummaryTable = true
    page.showSummaryEmpty = true
    page.usedHeight += 64
  }

  const interpretationHeight = estimateInterpretationHeight()
  const actionHeaderHeight = 42
  if (
    page.usedHeight + interpretationHeight > pageCapacity &&
    (page.showIntro || page.summaryRows.length)
  ) {
    startPage()
  }

  page.showInterpretation = true
  page.usedHeight += interpretationHeight

  pages.push(page)
  page = createPage(false)
  page.showActionReport = true
  page.usedHeight += actionHeaderHeight

  if (props.actionReportRows.length) {
    props.actionReportRows.forEach((row, index) => {
      const height = estimateActionRowHeight(row)
      const reservedSignatoryHeight = index === props.actionReportRows.length - 1
        ? signatoriesHeight
        : 0
      if (
        page.usedHeight + height + reservedSignatoryHeight > pageCapacity &&
        page.actionRows.length
      ) {
        startPage()
        page.showActionReport = true
        page.usedHeight = actionHeaderHeight
      }
      page.actionRows.push({ ...row, index })
      page.usedHeight += height
    })
  } else {
    page.showActionReportEmpty = true
  }

  if (page.actionRows.length && page.usedHeight + signatoriesHeight > pageCapacity) {
    startPage()
  }

  page.showSignatories = true
  page.usedHeight += signatoriesHeight
  pages.push(page)
  return pages.map((item, index) => ({
    ...item,
    number: index + 1
  }))
})

function createPage(showIntro) {
  return {
    showIntro,
    showSummaryTable: false,
    showSummaryEmpty: false,
    summaryRows: [],
    showInterpretation: false,
    showActionReport: false,
    showActionReportEmpty: false,
    showSignatories: false,
    actionRows: [],
    usedHeight: 0
  }
}

function estimateTextLines(value, charactersPerLine) {
  const text = String(value || '').trim()
  return text ? Math.max(1, Math.ceil(text.length / charactersPerLine)) : 1
}

function estimateIntroHeight() {
  const courseTitleHeight = estimateTextLines(props.evaluation?.course_title, 100) * 15
  const legendText = props.ratingScaleLegend.map(formatLegendEntry).join(' | ')
  const legendHeight = estimateTextLines(legendText, 120) * 12 + 12
  return 60 + courseTitleHeight + 40 + legendHeight + 20
}

function estimateSummaryRowHeight(row) {
  if (row.isOverallSpacer) return 7
  if (row.isHeader) return 20

  const lines = Math.max(
    estimateTextLines(row.label, 82),
    estimateTextLines(formatMean(row.mean), 12),
    estimateTextLines(row.description, 25),
    estimateTextLines(row.interpretation, 25)
  )
  return Math.max(18, lines * 11 + 6)
}

function estimateInterpretationHeight() {
  const text = props.ratingScaleLegend.map(formatInterpretationEntry).join(' | ')
  return estimateTextLines(text, 120) * 12 + 10
}

function estimateActionRowHeight(row) {
  const itemLines = (row.items || []).reduce(
    (total, item) => total + estimateTextLines(item, 72),
    0
  )
  const commentLines = (row.comments || []).reduce(
    (total, comment) => total + estimateTextLines(comment, 72),
    0
  )
  const actionLines = estimateTextLines(row.action || '—', 72)
  return Math.max(30, 42 + (1 + itemLines + commentLines) * 11, actionLines * 11 + 21)
}

function formatSignatoryTimestamp(value) {
  if (!value) return ''

  const timestamp = new Date(value)
  return Number.isNaN(timestamp.getTime()) ? String(value) : timestamp.toLocaleString()
}

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

function romanNumeral(value) {
  const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']
  return numerals[value - 1] || String(value)
}

async function printDocument() {
  if (isPreparingPrint.value) return

  isPreparingPrint.value = true
  printError.value = ''
  const generatedObjectUrls = []

  try {
    await nextTick()
    await document.fonts.ready

    const sheets = previewSheetElements.value.filter(Boolean)
    if (sheets.length !== previewPages.value.length) {
      throw new Error('The preview pages are not ready to print. Please try again.')
    }

    const imageSources = []
    for (const sheet of sheets) {
      const images = Array.from(sheet.querySelectorAll('img'))
      await Promise.all(images.map(image => image.decode()))

      const canvas = await html2canvas(sheet, {
        backgroundColor: '#ffffff',
        scale: 3,
        useCORS: true,
        logging: false
      })
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(result => {
          if (result) resolve(result)
          else reject(new Error('Could not create a printable image for a preview page.'))
        }, 'image/png')
      })
      canvas.width = 0
      canvas.height = 0
      const objectUrl = URL.createObjectURL(blob)
      generatedObjectUrls.push(objectUrl)
      imageSources.push(objectUrl)
    }

    printImageObjectUrls.forEach(URL.revokeObjectURL)
    printImageObjectUrls = generatedObjectUrls
    printImageSources.value = imageSources
    await nextTick()
    await Promise.all(
      Array.from(document.querySelectorAll('.print-page-image')).map(image => image.decode())
    )
    window.print()
  } catch (error) {
    generatedObjectUrls.forEach(url => URL.revokeObjectURL(url))
    printImageObjectUrls.forEach(URL.revokeObjectURL)
    printImageObjectUrls = []
    printImageSources.value = []
    printError.value = error instanceof Error
      ? `Unable to prepare the print preview: ${error.message}`
      : 'Unable to prepare the print preview.'
  } finally {
    isPreparingPrint.value = false
  }
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

/* .institution-heading::after {
  position: absolute;
  left: 3%;
  right: 6%;
  bottom: -1px;
  height: 6px;
  background: #f2c51d;
  clip-path: polygon(0 60%, 78% 60%, 100% 0, 100% 0, 96% 75%, 78% 100%, 0 65%);
  content: '';
} */

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

.action-report-table {
  width: 100%;
  margin-top: 12px;
  border-collapse: collapse;
  table-layout: fixed;
  color: #111;
  font-size: 9px;
  line-height: 1.25;
}

.action-report-table th,
.action-report-table td {
  padding: 3px 4px;
  border: 1px solid #222;
  text-align: left;
  vertical-align: top;
  overflow-wrap: anywhere;
}

.action-report-table thead tr:first-child th {
  background: #fff;
  color: #111;
  font-size: 10px;
  text-align: center;
}

.action-report-table thead tr:nth-child(2) th {
  font-weight: 700;
}

.action-report-indicator {
  break-after: avoid;
  page-break-after: avoid;
  font-style: italic;
}

.action-report-indicator th {
  padding-top: 4px;
  padding-bottom: 2px;
}

.action-report-details {
  break-inside: avoid;
  page-break-inside: avoid;
}

.action-report-details td:last-child {
  white-space: pre-line;
}

.action-report-comments {
  margin-top: 12px;
}

.action-report-empty {
  text-align: center !important;
}

.action-report-signatories {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  column-gap: 24px;
  row-gap: 24px;
  margin: 24px 4px 0;
  color: #111;
  font-size: 9px;
  break-inside: avoid;
  page-break-inside: avoid;
}

.action-report-signatory {
  min-width: 0;
  min-height: 34px;
}

.action-report-signatory-meta {
  display: flex;
  flex-direction: column;
  margin-top: 5px;
  color: #777;
  font-size: 8px;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.form-footer {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  box-sizing: border-box;
  border: 1px solid #222;
  color: #111;
  font-family: Arial, sans-serif;
}

.form-footer::before,
.form-footer::after {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: #222;
  content: '';
  pointer-events: none;
}

.form-footer::before {
  left: 33.3333%;
}

.form-footer::after {
  left: 66.6667%;
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
  display: grid;
  grid-template-rows: 1fr 1fr;
  align-items: center;
  min-height: 56px;
  text-align: center;
  font-size: 8px;
  line-height: 1.15;
}

.signature-space strong {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  padding: 2px 4px;
  border-bottom: 1px solid #222;
  font-size: 9px;
}

.signature-space span {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  padding: 2px 4px;
}

@media screen {
  .print-source {
    display: none;
  }

  .print-image-pages {
    display: none;
  }

  .preview-pages {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    max-width: 100%;
    overflow-x: auto;
    padding: 8px 0 24px;
  }

  .preview-sheet {
    position: relative;
    box-sizing: border-box;
    flex: 0 0 auto;
    width: 210mm;
    height: 297mm;
    padding: 15mm 15mm 38mm;
    border: 0;
    outline: 1px solid #d5d9df;
    background: #fff;
    box-shadow: 0 8px 28px rgb(22 34 51 / 14%);
    color: #202630;
  }

  .preview-document-body {
    padding-top: 12px;
  }

  .preview-page-footer {
    position: absolute;
    right: 15mm;
    bottom: 5mm;
    left: 15mm;
    height: 20mm;
    box-sizing: border-box;
  }

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

  .preview-pages {
    align-items: flex-start;
  }

  .preview-sheet .form-header {
    grid-template-columns: 102px minmax(0, 1fr);
  }

  .preview-sheet .form-seal {
    padding: 8px;
  }

  .preview-sheet .form-seal img {
    width: 76px;
    height: 76px;
  }

  .preview-sheet .institution-heading h1 {
    font-size: 17px;
  }

  .preview-sheet .institution-heading p,
  .preview-sheet .metadata-row {
    font-size: 11px;
  }

  .preview-sheet .metadata-row {
    grid-template-columns: 1.15fr 1.65fr 0.9fr;
  }

  .preview-sheet .metadata-row > div {
    padding: 5px 7px;
  }

  .preview-sheet .metadata-primary .form-name {
    font-size: 12px;
  }

  .preview-sheet .metadata-secondary > div {
    flex-wrap: nowrap;
  }

  .preview-sheet .approval-cell h2 {
    padding: 5px 6px;
    font-size: 10px;
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
  margin: 0;
}

@media print {
  .preview-pages,
  .print-source {
    display: none !important;
  }

  .print-image-pages {
    display: block !important;
    width: 210mm !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .print-page-image {
    display: block !important;
    width: 210mm !important;
    height: 297mm !important;
    margin: 0 !important;
    padding: 0 !important;
    break-after: page;
    page-break-after: always;
  }

  .print-page-image:last-child {
    break-after: auto;
    page-break-after: auto;
  }

  :global(body *:has(.print-page)) {
    display: contents !important;
  }

  :global(body *:not(:has(.print-page)):not(.print-page):not(.print-page *)) {
    display: none !important;
  }

  :global(html),
  :global(body),
  :global(#q-app),
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
  .preview-pages,
  .preview-pages *,
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

  .print-image-pages,
  .print-image-pages * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
</style>