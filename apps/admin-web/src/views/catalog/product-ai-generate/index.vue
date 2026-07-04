<template>
  <div class="ai-page">
    <div class="product-head">
      <el-image class="product-image" :src="product?.mainImage || fallbackImage" fit="cover" />
      <div class="product-info">
        <h2>{{ product?.name || "商品 AI 生成" }}</h2>
        <div class="meta">
          <span>ID：{{ product?.id }}</span>
          <span>售价：¥{{ product?.price }}</span>
          <span>库存：{{ product?.stock }}</span>
        </div>
      </div>
      <el-button @click="router.push('/catalog/product')">返回商品管理</el-button>
    </div>

    <el-tabs v-model="activeTab" class="tabs">
      <el-tab-pane label="生成商品图" name="image">
        <section class="workbench">
          <div class="panel">
            <h3>素材与模式</h3>
            <el-form label-width="92px">
              <el-form-item label="原图">
                <el-radio-group v-model="imageForm.imageUrl" class="image-options">
                  <el-radio-button v-for="url in imageOptions" :key="url" :value="url">已有图片</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="上传图片">
                <el-upload :auto-upload="false" :show-file-list="false" accept="image/*" :on-change="onImageUpload">
                  <el-button>选择本地图片</el-button>
                </el-upload>
              </el-form-item>
              <el-form-item label="图片URL">
                <el-input v-model="imageForm.imageUrl" placeholder="可粘贴新的图片 URL" />
              </el-form-item>
              <el-form-item label="生成模式">
                <el-segmented v-model="imageForm.mode" :options="imageModes" />
              </el-form-item>
              <el-form-item label="提示词">
                <el-input v-model="imageForm.prompt" type="textarea" :rows="4" placeholder="例如：浅灰摄影棚背景，柔和阴影，高级电商主图" />
              </el-form-item>
            </el-form>
            <el-button type="primary" :loading="imageLoading" @click="onGenerateImage">生成商品图</el-button>
          </div>

          <div class="panel result-panel">
            <h3>生成结果</h3>
            <el-empty v-if="!generatedImage" description="暂无生成结果" />
            <template v-else>
              <el-image class="result-image" :src="generatedImage.imageUrl" fit="cover" />
              <div class="result-actions">
                <el-button :loading="imageLoading" @click="onGenerateImage">重新生成</el-button>
                <el-button tag="a" :href="generatedImage.imageUrl" target="_blank">下载</el-button>
                <el-button type="success" :loading="replaceLoading" @click="onReplaceMainImage">替换主图</el-button>
              </div>
            </template>
          </div>
        </section>
      </el-tab-pane>

      <el-tab-pane label="生成推广视频" name="video">
        <section class="workbench">
          <div class="panel">
            <h3>视频素材</h3>
            <el-form label-width="92px">
              <el-form-item label="商品图片">
                <el-checkbox-group v-model="videoForm.imageUrls" class="checkbox-images">
                  <el-checkbox v-for="url in imageOptions" :key="url" :value="url">
                    <el-image :src="url" fit="cover" />
                  </el-checkbox>
                </el-checkbox-group>
              </el-form-item>
              <el-form-item label="推广文案">
                <el-input v-model="videoForm.copyText" type="textarea" :rows="4" placeholder="输入推广文案" />
                <el-button class="copy-btn" @click="fillCopy">AI自动生成</el-button>
              </el-form-item>
              <el-form-item label="模板">
                <el-select v-model="videoForm.template" style="width: 100%">
                  <el-option label="快节奏带货（15秒）" value="fast_sale_15s" />
                  <el-option label="细节展示（30秒）" value="detail_show_30s" />
                  <el-option label="促销活动（倒计时）" value="promo_countdown" />
                </el-select>
              </el-form-item>
              <el-form-item label="配音">
                <el-select v-model="videoForm.voiceStyle" style="width: 100%">
                  <el-option label="激昂" value="energetic" />
                  <el-option label="温柔" value="soft" />
                  <el-option label="专业讲解" value="professional" />
                </el-select>
              </el-form-item>
            </el-form>
            <el-button type="primary" :loading="videoLoading" @click="onGenerateVideo">生成推广视频</el-button>
          </div>

          <div class="panel result-panel">
            <h3>任务进度</h3>
            <el-empty v-if="!videoTask" description="暂无视频任务" />
            <template v-else>
              <el-progress :percentage="videoTask.progress || 0" :status="videoTask.status === 'FAILED' ? 'exception' : videoTask.status === 'SUCCESS' ? 'success' : undefined" />
              <el-descriptions :column="1" border size="small" class="task-desc">
                <el-descriptions-item label="任务ID">{{ videoTask.taskId }}</el-descriptions-item>
                <el-descriptions-item label="状态">{{ videoTask.status }}</el-descriptions-item>
                <el-descriptions-item label="服务">{{ videoTask.provider || '-' }}</el-descriptions-item>
              </el-descriptions>
              <div v-if="videoTask.outputUrl" class="result-actions">
                <el-button tag="a" :href="videoTask.outputUrl" target="_blank">预览</el-button>
                <el-button tag="a" :href="videoTask.outputUrl" target="_blank">下载 MP4</el-button>
                <el-button @click="copyVideoUrl">复制分享链接</el-button>
              </div>
            </template>
          </div>
        </section>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, type UploadFile } from "element-plus";
import { ApiError, type AiTaskDTO, type GenerateImageResponse, type SpuDTO } from "@/api";
import { loadProduct } from "@/use-cases/product.uc";
import { generateProductImage } from "@/use-cases/product-ai/generateProductImage";
import { replaceProductMainImage } from "@/use-cases/product-ai/replaceProductMainImage";
import { generateProductVideo } from "@/use-cases/product-ai/generateProductVideo";
import { loadAiTaskStatus } from "@/use-cases/product-ai/loadAiTaskStatus";
import { subscribeAiTaskProgress } from "@/use-cases/product-ai/subscribeAiTaskProgress";

const route = useRoute();
const router = useRouter();
const product = ref<SpuDTO | null>(null);
const activeTab = ref("image");
const imageLoading = ref(false);
const replaceLoading = ref(false);
const videoLoading = ref(false);
const generatedImage = ref<GenerateImageResponse | null>(null);
const videoTask = ref<AiTaskDTO | null>(null);
const stopProgress = ref<(() => void) | null>(null);
const fallbackImage = "https://placehold.co/420x420?text=Smart+Mall";

const imageModes = [
  { label: "换背景", value: "change_background" },
  { label: "风格转换", value: "style_transfer" },
  { label: "智能优化", value: "smart_optimize" },
];

const imageForm = reactive({
  imageUrl: "",
  mode: "change_background",
  prompt: "",
});

const videoForm = reactive({
  imageUrls: [] as string[],
  copyText: "",
  template: "fast_sale_15s",
  voiceStyle: "energetic",
});

const imageOptions = computed(() => {
  const urls = [
    product.value?.mainImage || fallbackImage,
    generatedImage.value?.imageUrl,
    "https://placehold.co/420x420?text=Detail+01",
    "https://placehold.co/420x420?text=Detail+02",
  ].filter(Boolean) as string[];
  return Array.from(new Set(urls)).slice(0, 9);
});

async function init() {
  try {
    product.value = await loadProduct(Number(route.params.id));
    imageForm.imageUrl = product.value.mainImage || fallbackImage;
    videoForm.imageUrls = [imageForm.imageUrl];
    fillCopy();
  } catch (e) {
    ElMessage.error(e instanceof ApiError ? e.message : "加载商品失败");
  }
}

function onImageUpload(file: UploadFile) {
  const raw = file.raw;
  if (!raw) return;
  imageForm.imageUrl = URL.createObjectURL(raw);
}

async function onGenerateImage() {
  if (!product.value?.id || !imageForm.imageUrl) {
    ElMessage.warning("请选择原图");
    return;
  }
  imageLoading.value = true;
  try {
    generatedImage.value = await generateProductImage({
      productId: product.value.id,
      imageUrl: imageForm.imageUrl,
      mode: imageForm.mode,
      prompt: imageForm.prompt,
    });
    ElMessage.success("商品图已生成");
  } catch (e) {
    ElMessage.error(e instanceof ApiError ? e.message : "生成商品图失败");
  } finally {
    imageLoading.value = false;
  }
}

async function onReplaceMainImage() {
  if (!product.value?.id || !generatedImage.value?.imageUrl) return;
  replaceLoading.value = true;
  try {
    product.value = await replaceProductMainImage(product.value.id, generatedImage.value.imageUrl);
    imageForm.imageUrl = product.value.mainImage || imageForm.imageUrl;
    ElMessage.success("已替换商品主图");
  } catch (e) {
    ElMessage.error(e instanceof ApiError ? e.message : "替换主图失败");
  } finally {
    replaceLoading.value = false;
  }
}

function fillCopy() {
  const name = product.value?.name || "精选商品";
  videoForm.copyText = `${name} 正在热卖，高清质感、价格友好，适合直播间和短视频投放。`;
}

async function onGenerateVideo() {
  if (!product.value?.id) return;
  if (!videoForm.imageUrls.length) {
    ElMessage.warning("请选择至少一张商品图片");
    return;
  }
  videoLoading.value = true;
  stopProgress.value?.();
  try {
    const resp = await generateProductVideo({
      productId: product.value.id,
      imageUrls: videoForm.imageUrls.slice(0, 9),
      copyText: videoForm.copyText,
      template: videoForm.template,
      voiceStyle: videoForm.voiceStyle,
    });
    videoTask.value = await loadAiTaskStatus(resp.taskId);
    stopProgress.value = subscribeAiTaskProgress(resp.taskId, (next) => {
      videoTask.value = next;
      if (next.status === "SUCCESS" || next.status === "FAILED") {
        videoLoading.value = false;
      }
    });
  } catch (e) {
    videoLoading.value = false;
    ElMessage.error(e instanceof ApiError ? e.message : "生成视频失败");
  }
}

async function copyVideoUrl() {
  if (!videoTask.value?.outputUrl) return;
  await navigator.clipboard.writeText(videoTask.value.outputUrl);
  ElMessage.success("分享链接已复制");
}

onMounted(init);
onBeforeUnmount(() => stopProgress.value?.());
</script>

<style scoped>
.ai-page { display: flex; flex-direction: column; gap: 14px; }
.product-head { display: flex; align-items: center; gap: 16px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; }
.product-image { width: 76px; height: 76px; border-radius: 6px; background: #f3f4f6; }
.product-info { flex: 1; min-width: 0; }
.product-info h2 { margin: 0 0 8px; color: #111827; font-size: 20px; }
.meta { display: flex; gap: 14px; flex-wrap: wrap; color: #6b7280; font-size: 13px; }
.tabs { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 0 16px 16px; }
.workbench { display: grid; grid-template-columns: minmax(320px, 420px) 1fr; gap: 14px; }
.panel { border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; min-width: 0; }
.panel h3 { margin: 0 0 14px; font-size: 16px; color: #111827; }
.image-options { display: flex; gap: 8px; flex-wrap: wrap; }
.result-panel { display: flex; flex-direction: column; gap: 12px; }
.result-image { width: min(420px, 100%); aspect-ratio: 1; border-radius: 8px; background: #f3f4f6; align-self: flex-start; }
.result-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.checkbox-images { display: grid; grid-template-columns: repeat(auto-fill, minmax(72px, 1fr)); gap: 8px; width: 100%; }
.checkbox-images :deep(.el-checkbox) { height: auto; margin-right: 0; }
.checkbox-images :deep(.el-checkbox__label) { padding-left: 6px; }
.checkbox-images .el-image { width: 56px; height: 56px; border-radius: 6px; vertical-align: middle; }
.copy-btn { margin-top: 8px; }
.task-desc { margin-top: 12px; }
@media (max-width: 900px) {
  .workbench { grid-template-columns: 1fr; }
  .product-head { align-items: flex-start; flex-wrap: wrap; }
}
</style>
