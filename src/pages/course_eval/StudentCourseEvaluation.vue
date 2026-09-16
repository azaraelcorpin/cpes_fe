<template>
	<q-page class="student-evaluation-page q-pa-md q-pa-lg-xl">
		<div class="evaluation-container">
			<q-card flat bordered class="evaluation-header">
				<q-card-section class="q-pb-sm">
					<div class="row items-start q-col-gutter-md">
						<div class="col">
							<div class="text-overline text-primary text-weight-bold">Student course evaluation</div>
							<h1 class="text-h5 text-weight-bold q-my-xs text-grey-9">
								{{ evaluation.course_title || 'Course evaluation' }}
							</h1>
							<div class="text-body2 text-grey-7">
								{{ evaluation.course_code || 'Course code unavailable' }}
							</div>
						</div>
						<div class="col-auto text-right text-caption text-grey-6">
							<div>{{ evaluation.acad_year }}</div>
							<div v-if="evaluation.sem">Semester {{ evaluation.sem }}</div>
						</div>
					</div>
				</q-card-section>

				<q-card-section class="q-pt-sm">
					<div class="row items-center q-mb-xs">
						<span class="text-caption text-grey-7">Evaluation progress</span>
						<q-space />
						<span class="text-caption text-weight-bold text-grey-8">
							{{ completedItems }} of {{ totalItems }} items completed
						</span>
					</div>
					<q-linear-progress
						:value="progress"
						color="primary"
						track-color="grey-3"
						rounded
						size="8px"
					/>
				</q-card-section>
			</q-card>

			<q-form class="q-mt-lg" @submit.prevent="submitEvaluation">
				<section
					v-for="indicator in sortedIndicators"
					:key="indicator.indicator_id"
					class="indicator-section q-mb-xl"
				>
					<div class="indicator-heading row items-center q-mb-md">
						<q-avatar color="primary" text-color="white" size="34px">
							{{ indicator.sort_order }}
						</q-avatar>
						<div class="q-ml-sm">
							<h2 class="text-subtitle1 text-weight-bold q-my-none text-grey-9">
								{{ indicator.indicator_name }}
							</h2>
							<div class="text-caption text-grey-6">{{ indicator.assigned_role }}</div>
						</div>
					</div>

					<q-card
						v-for="item in sortedItems(indicator)"
						:key="item.item_id"
						flat
						bordered
						class="evaluation-item-card q-mb-md"
						:class="{ 'answered-card': isAnswered(item.item_id) }"
					>
						<q-card-section>
							<div class="row q-col-gutter-md">
								<div class="col">
									<div class="row items-center no-wrap">
									<q-avatar color="grey-2" text-color="grey-8" size="30px">
										{{ item.sort_order }}
									</q-avatar>
									<div class="text-body1 text-weight-medium item-name q-ml-md">
										{{ item.item_name }}
									</div>
									</div>
									<q-btn-toggle
										v-model="answers[item.item_id]"
										class="rating-options q-mt-md"
										:options="ratingScaleItems"
										spread
										unelevated
										toggle-color="primary"
										color="grey-2"
										text-color="dark"
										no-caps
									/>
								</div>
							</div>
						</q-card-section>
					</q-card>
				</section>

				<q-card v-if="!totalItems" flat bordered class="q-pa-lg text-center text-grey-6">
					No evaluation items are available.
				</q-card>

				<div class="row justify-end q-mt-lg">
					<q-btn
						unelevated
						color="primary"
						no-caps
						icon="send"
						label="Submit evaluation"
						type="submit"
						:disable="!isComplete"
					/>
				</div>
			</q-form>
		</div>
	</q-page>
</template>

<script>
import api from 'src/API/api.js'

const samplePayload = {
	data: [
		{
			_id: '11',
			acad_year: '2026-2027',
			sem: 21,
			course_code: 'ABM163',
			course_title: 'Intro to Agricultural Marketing Management',
			status: 'DRAFT',
			rating_scale_id: '1',
			indicators: [
				{
					indicator_id: 10,
					indicator_name: 'Course Outcome Achievement',
					sort_order: 1,
					assigned_role: 'COORDINATOR',
					evaluation_items: [
						{ item_id: 8, item_name: 'CO1: Explain key concepts and principles.', sort_order: 1 }
					]
				},
				{
					indicator_id: 11,
					indicator_name: 'Course Quality',
					sort_order: 2,
					assigned_role: 'VCAA',
					evaluation_items: [
						{ item_id: 10, item_name: 'The Course is essential and related to the discipline.', sort_order: 1 },
						{ item_id: 11, item_name: 'The course content is relevant, appropriate and up-to-date.', sort_order: 2 }
					]
				}
			]
		}
	]
}

export default {
	name: 'StudentCourseEvaluation',

	props: {
		evaluationPayload: {
			type: Object,
			default: () => samplePayload
		}
	},

	emits: ['submit'],

	data () {
		return {
			evaluationData: null,
			loading: false,
			answers: {},
			ratingScales: {
				'1': [
					{ label: 'Strongly Agree', value: 4 },
					{ label: 'Agree', value: 3 },
					{ label: 'Disagree', value: 2 },
					{ label: 'Strongly Disagree', value: 1 }
				]
			}
		}
	},

	computed: {
		evaluation () {
			return this.evaluationData || this.evaluationPayload?.data?.[0] || {}
		},

		sortedIndicators () {
			return [...(this.evaluation.indicators || [])].sort((first, second) => first.sort_order - second.sort_order)
		},

		ratingScaleItems () {
			if (Array.isArray(this.evaluation.ratingScaleItems)) {
				return [...this.evaluation.ratingScaleItems]
					.sort((first, second) => first.fixed_value - second.fixed_value)
					.map(item => ({
						label: item.description,
						value: item.fixed_value
					}))
			}

			return this.ratingScales[String(this.evaluation.rating_scale_id)] || this.ratingScales['1']
		},

		totalItems () {
			return this.sortedIndicators.reduce((total, indicator) => total + (indicator.evaluation_items || []).length, 0)
		},

		completedItems () {
			return this.sortedIndicators.reduce((total, indicator) => {
				return total + this.sortedItems(indicator).filter(item => this.isAnswered(item.item_id)).length
			}, 0)
		},

		progress () {
			return this.totalItems ? this.completedItems / this.totalItems : 0
		},

		isComplete () {
			return this.totalItems > 0 && this.completedItems === this.totalItems
		},

		submissionPayload () {
			return Object.entries(this.answers).map(([itemId, givenRating]) => ({
				item_id: Number(itemId),
				given_rating: givenRating
			}))
		}
	},

	watch: {
		evaluationPayload: {
			deep: true,
			handler () {
				this.answers = {}
			}
		}
	},

	mounted () {
		this.fetchEvaluationData()
	},

	methods: {
		async fetchEvaluationData () {
			const evaluationId = this.$route.params.id

			if (!evaluationId) {
				this.notifyError('Evaluation id is required.')
				return
			}

			this.loading = true

			try {
				const response = await api.getByEvaluation_Id(evaluationId)

				if (!response?.success || !Array.isArray(response.data) || !response.data.length) {
					throw new Error(response?.error?.response?.data?.message || 'Evaluation details were not found.')
				}

				this.evaluationData = response.data[0]
				this.answers = {}
			} catch (error) {
				this.notifyError(error.message || 'Failed to load evaluation details.')
			} finally {
				this.loading = false
			}
		},

		notifyError (message) {
			if (this.$q) {
				this.$q.notify({ type: 'negative', message })
			}
		},

		sortedItems (indicator) {
			return [...(indicator.evaluation_items || [])].sort((first, second) => first.sort_order - second.sort_order)
		},

		isAnswered (itemId) {
			return this.answers[itemId] !== undefined && this.answers[itemId] !== null
		},

		submitEvaluation () {
			if (!this.isComplete) return

			const payload = this.submissionPayload
			this.$emit('submit', payload)

			if (this.$q) {
				this.$q.notify({
					type: 'positive',
					message: 'Evaluation submitted successfully.'
				})
			}
		}
	}
}
</script>

<style scoped>
.student-evaluation-page {
	min-height: 100%;
	background: #f5f7fb;
}

.evaluation-container {
	width: min(100%, 960px);
	margin: 0 auto;
}

.evaluation-header {
	position: sticky;
	top: 0;
	z-index: 10;
	background: rgba(255, 255, 255, 0.97);
	border-radius: 10px;
	box-shadow: 0 4px 18px rgba(37, 55, 80, 0.08);
}

.evaluation-header h1 {
	max-width: 720px;
}

.indicator-heading {
	border-bottom: 1px solid #dfe5ee;
	padding-bottom: 10px;
}

.evaluation-item-card {
	border-left: 4px solid transparent;
	border-radius: 8px;
	transition: border-color 0.2s ease, background-color 0.2s ease;
}

.answered-card {
	border-left-color: var(--q-primary);
	background: #f2f8ff;
}

.item-name {
	line-height: 1.5;
}

.rating-options {
	display: flex;
	width: 100%;
	border: 1px solid #d9dee7;
	border-radius: 6px;
}

.rating-options :deep(.q-btn) {
	flex: 1 1 0;
	min-width: 0;
	white-space: normal;
	line-height: 1.3;
}

@media (max-width: 599px) {
	.evaluation-header {
		top: 0;
	}

	.rating-options {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		border: 0;
		border-radius: 0;
		gap: 6px;
	}

	.rating-options :deep(.q-btn) {
		width: 100%;
		border-radius: 6px;
	}
}
</style>
