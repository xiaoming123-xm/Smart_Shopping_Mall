<template>
  <div class="ai-center">
    <section class="hero">
      <div>
        <h2>AI内容生成</h2>
        <p>围绕商品素材生成电商主图和推广视频，图片与视频是两个独立工作区。</p>
      </div>
      <div class="context">
        <el-select v-model="selectedProductId" filterable placeholder="选择商品上下文" style="width: 260px" @change="syncProductMaterial">
          <el-option v-for="item in products" :key="item.id" :label="item.name" :value="item.id!" />
        </el-select>
        <el-button @click="router.push('/catalog/product')">商品管理</el-button>
      </div>
    </section>

    <section class="product-context" v-if="selectedProduct">
      <el-image class="product-cover" :src="selectedProduct.mainImage || fallbackImage" fit="cover" />
      <div>
        <h3>{{ selectedProduct.name }}</h3>
        <div class="meta">
          <span>ID：{{ selectedProduct.id }}</span>
          <span>售价：¥{{ selectedProduct.price }}</span>
          <span>库存：{{ selectedProduct.stock ?? 0 }}</span>
        </div>
      </div>
    </section>

    <section class="feature-grid">
      <article class="feature-card">
        <header class="feature-head">
          <div>
            <h3>商品图片展示 AI 生成</h3>
            <p>上传或选择一张商品图，输入你想要的改图要求，让 AI 生成新的展示图。</p>
          </div>
          <el-tag type="success">图片</el-tag>
        </header>

        <div class="editor-grid">
          <div class="editor-panel">
            <el-form label-width="92px">
              <el-form-item label="输入图片">
                <div class="upload-row">
                  <el-upload :auto-upload="false" :show-file-list="false" accept="image/*" :on-change="onImageUpload">
                    <el-button>上传一张图片</el-button>
                  </el-upload>
                  <el-button @click="useProductImage">使用商品主图</el-button>
                </div>
              </el-form-item>
              <el-form-item label="图片URL">
                <el-input v-model="imageForm.imageUrl" placeholder="上传后自动填入，也可以粘贴图片 URL" />
              </el-form-item>
              <el-form-item label="生成模式">
                <el-segmented v-model="imageForm.mode" :options="imageModes" />
              </el-form-item>
              <el-form-item label="改图要求">
                <el-input
                  v-model="imageForm.prompt"
                  type="textarea"
                  :rows="5"
                  placeholder="例如：保留商品主体，改成浅灰摄影棚背景，增强清晰度，适合电商主图"
                />
              </el-form-item>
            </el-form>
            <el-button type="primary" :loading="imageLoading" @click="onGenerateImage">生成/改正商品图</el-button>
          </div>

          <div class="preview-panel">
            <div class="preview-title">图片预览</div>
            <div class="image-compare">
              <div class="image-box">
                <span>原图</span>
                <el-image :src="imageForm.imageUrl || fallbackImage" fit="cover" />
              </div>
              <div class="image-box">
                <span>AI结果</span>
                <el-empty v-if="!generatedImage" description="等待生成" />
                <el-image v-else :src="generatedImage.imageUrl" fit="cover" />
              </div>
            </div>
            <div class="result-actions" v-if="generatedImage">
              <el-button tag="a" :href="generatedImage.imageUrl" target="_blank">下载图片</el-button>
              <el-button :loading="imageLoading" @click="onGenerateImage">重新生成</el-button>
              <el-button type="success" :loading="replaceLoading" @click="onReplaceMainImage">设为商品主图</el-button>
            </div>
          </div>
        </div>
      </article>

      <article class="feature-card">
        <header class="feature-head">
          <div>
            <h3>商品视频展示 AI 生成</h3>
            <p>上传商品素材，填写推广文案和视频风格，生成可预览、下载、分享的推广视频任务。</p>
          </div>
          <el-tag type="warning">视频</el-tag>
        </header>

        <div class="editor-grid">
          <div class="editor-panel">
            <el-form label-width="92px">
              <el-form-item label="素材图片">
                <div class="upload-row">
                  <el-upload :auto-upload="false" :show-file-list="false" accept="image/*" multiple :on-change="onVideoUpload">
                    <el-button>上传素材</el-button>
                  </el-upload>
                  <el-button @click="addProductImageToVideo">加入商品主图</el-button>
                </div>
              </el-form-item>
              <el-form-item label="已选素材">
                <div class="material-strip">
                  <div v-for="url in videoForm.imageUrls" :key="url" class="material">
                    <el-image :src="url" fit="cover" />
                    <button @click="removeVideoImage(url)">×</button>
                  </div>
                  <span v-if="videoForm.imageUrls.length === 0" class="hint">最多 9 张图片</span>
                </div>
              </el-form-item>
              <el-form-item label="推广文案">
                <el-input v-model="videoForm.copyText" type="textarea" :rows="4" placeholder="输入要展示在视频里的卖点、场景、促销信息" />
                <el-button class="copy-btn" @click="fillCopy">AI自动生成文案</el-button>
              </el-form-item>
              <el-form-item label="视频模板">
                <el-select v-model="videoForm.template" style="width: 100%">
                  <el-option label="快节奏带货（15秒）" value="fast_sale_15s" />
                  <el-option label="细节展示（30秒）" value="detail_show_30s" />
                  <el-option label="促销活动（倒计时）" value="promo_countdown" />
                </el-select>
              </el-form-item>
              <el-form-item label="配音风格">
                <el-select v-model="videoForm.voiceStyle" style="width: 100%">
                  <el-option label="激昂带货" value="energetic" />
                  <el-option label="温柔种草" value="soft" />
                  <el-option label="专业讲解" value="professional" />
                </el-select>
              </el-form-item>
            </el-form>
            <el-button type="primary" :loading="videoLoading" @click="onGenerateVideo">生成推广视频</el-button>
          </div>

          <div class="preview-panel">
            <div class="preview-title">视频任务</div>
            <el-empty v-if="!videoTask" description="等待生成视频" />
            <template v-else>
              <el-progress :percentage="videoTask.progress || 0" :status="videoTask.status === 'FAILED' ? 'exception' : videoTask.status === 'SUCCESS' ? 'success' : undefined" />
              <el-descriptions :column="1" border size="small" class="task-desc">
                <el-descriptions-item label="任务ID">{{ videoTask.taskId }}</el-descriptions-item>
                <el-descriptions-item label="状态">{{ videoTask.status }}</el-descriptions-item>
                <el-descriptions-item label="服务">{{ videoTask.provider || '-' }}</el-descriptions-item>
              </el-descriptions>
              <div class="video-preview" v-if="videoTask.outputUrl">
                <div class="play-box">MP4</div>
                <a :href="videoTask.outputUrl" target="_blank">{{ videoTask.outputUrl }}</a>
              </div>
              <div class="result-actions" v-if="videoTask.outputUrl">
                <el-button tag="a" :href="videoTask.outputUrl" target="_blank">预览</el-button>
                <el-button tag="a" :href="videoTask.outputUrl" target="_blank">下载 MP4</el-button>
                <el-button @click="copyVideoUrl">复制分享链接</el-button>
              </div>
            </template>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, type UploadFile } from "element-plus";
import { ApiError, type AiTaskDTO, type GenerateImageResponse, type SpuDTO } from "@/api";
import { loadProducts } from "@/use-cases/product.uc";
import { generateProductImage } from "@/use-cases/product-ai/generateProductImage";
import { replaceProductMainImage } from "@/use-cases/product-ai/replaceProductMainImage";
import { generateProductVideo } from "@/use-cases/product-ai/generateProductVideo";
import { loadAiTaskStatus } from "@/use-cases/product-ai/loadAiTaskStatus";
import { subscribeAiTaskProgress } from "@/use-cases/product-ai/subscribeAiTaskProgress";

const router = useRouter();
const products = ref<SpuDTO[]>([]);
const selectedProductId = ref<number>();
const imageLoading = ref(false);
const replaceLoading = ref(false);
const videoLoading = ref(false);
const generatedImage = ref<GenerateImageResponse | null>(null);
const videoTask = ref<AiTaskDTO | null>(null);
const stopProgress = ref<(() => void) | null>(null);
const fallbackImage = "https://placehold.co/520x520?text=Upload+Image";

const selectedProduct = computed(() => products.value.find((item) => item.id === selectedProductId.value));

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

async function load() {
  try {
    products.value = await loadProducts();
    if (!selectedProductId.value) {
      selectedProductId.value = products.value[0]?.id;
    }
    syncProductMaterial();
  } catch (e) {
    ElMessage.error(e instanceof ApiError ? e.message : "加载商品失败");
  }
}

function syncProductMaterial() {
  if (!imageForm.imageUrl) {
    useProductImage();
  }
  if (!videoForm.imageUrls.length) {
    addProductImageToVideo();
  }
  fillCopy();
}

function useProductImage() {
  imageForm.imageUrl = selectedProduct.value?.mainImage || fallbackImage;
}

function addProductImageToVideo() {
  const url = selectedProduct.value?.mainImage || imageForm.imageUrl || fallbackImage;
  if (!videoForm.imageUrls.includes(url) && videoForm.imageUrls.length < 9) {
    videoForm.imageUrls.push(url);
  }
}

function onImageUpload(file: UploadFile) {
  const raw = file.raw;
  if (!raw) return;
  imageForm.imageUrl = URL.createObjectURL(raw);
}

function onVideoUpload(file: UploadFile) {
  const raw = file.raw;
  if (!raw || videoForm.imageUrls.length >= 9) return;
  videoForm.imageUrls.push(URL.createObjectURL(raw));
}

function removeVideoImage(url: string) {
  videoForm.imageUrls = videoForm.imageUrls.filter((item) => item !== url);
}

async function onGenerateImage() {
  if (!selectedProductId.value) {
    ElMessage.warning("请先选择商品");
    return;
  }
  if (!imageForm.imageUrl) {
    ElMessage.warning("请上传或选择一张图片");
    return;
  }
  imageLoading.value = true;
  try {
    generatedImage.value = await generateProductImage({
      productId: selectedProductId.value,
      imageUrl: imageForm.imageUrl,
      mode: imageForm.mode,
      prompt: imageForm.prompt,
    });
    ElMessage.success("AI 商品图已生成");
  } catch (e) {
    ElMessage.error(e instanceof ApiError ? e.message : "生成商品图失败");
  } finally {
    imageLoading.value = false;
  }
}

async function onReplaceMainImage() {
  if (!selectedProductId.value || !generatedImage.value?.imageUrl) return;
  replaceLoading.value = true;
  try {
    await replaceProductMainImage(selectedProductId.value, generatedImage.value.imageUrl);
    await load();
    imageForm.imageUrl = generatedImage.value.imageUrl;
    ElMessage.success("已设为商品主图");
  } catch (e) {
    ElMessage.error(e instanceof ApiError ? e.message : "替换主图失败");
  } finally {
    replaceLoading.value = false;
  }
}

function fillCopy() {
  const name = selectedProduct.value?.name || "精选商品";
  videoForm.copyText = `${name}，突出商品质感、使用场景和促销卖点，节奏清晰，适合短视频投放。`;
}

async function onGenerateVideo() {
  if (!selectedProductId.value) {
    ElMessage.warning("请先选择商品");
    return;
  }
  if (!videoForm.imageUrls.length) {
    ElMessage.warning("请上传至少一张视频素材图");
    return;
  }
  videoLoading.value = true;
  stopProgress.value?.();
  try {
    const resp = await generateProductVideo({
      productId: selectedProductId.value,
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

onMounted(load);
onBeforeUnmount(() => stopProgress.value?.());
</script>

<style scoped>
.ai-center { display: flex; flex-direction: column; gap: 14px; }
.hero, .product-context, .feature-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; }
.hero { display: flex; justify-content: space-between; align-items: center; gap: 14px; padding: 16px 18px; }
.hero h2, .product-context h3, .feature-head h3 { margin: 0; color: #111827; }
.hero p, .feature-head p { margin: 6px 0 0; color: #6b7280; font-size: 13px; line-height: 1.5; }
.context { display: flex; align-items: center; gap: 10px; }
.product-context { display: flex; align-items: center; gap: 14px; padding: 12px 14px; }
.product-cover { width: 64px; height: 64px; border-radius: 6px; background: #f3f4f6; }
.meta { display: flex; flex-wrap: wrap; gap: 12px; color: #6b7280; font-size: 13px; margin-top: 6px; }
.feature-grid { display: grid; gap: 14px; }
.feature-card { padding: 16px; }
.feature-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; padding-bottom: 14px; border-bottom: 1px solid #eef2f7; }
.editor-grid { display: grid; grid-template-columns: minmax(320px, 430px) 1fr; gap: 14px; margin-top: 14px; }
.editor-panel, .preview-panel { border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; min-width: 0; }
.upload-row, .result-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.preview-title { font-weight: 700; color: #111827; margin-bottom: 12px; }
.image-compare { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.image-box { min-width: 0; border: 1px dashed #d1d5db; border-radius: 8px; padding: 10px; }
.image-box span { display: block; color: #6b7280; font-size: 12px; margin-bottom: 8px; }
.image-box .el-image { width: 100%; aspect-ratio: 1; border-radius: 6px; background: #f3f4f6; }
.result-actions { margin-top: 12px; }
.material-strip { width: 100%; display: flex; gap: 8px; flex-wrap: wrap; min-height: 64px; align-items: center; }
.material { position: relative; width: 58px; height: 58px; border-radius: 6px; overflow: hidden; background: #f3f4f6; border: 1px solid #e5e7eb; }
.material .el-image { width: 100%; height: 100%; }
.material button { position: absolute; top: 2px; right: 2px; border: none; background: rgba(17,24,39,.72); color: #fff; width: 18px; height: 18px; border-radius: 50%; cursor: pointer; line-height: 16px; }
.hint { color: #9ca3af; font-size: 12px; }
.copy-btn { margin-top: 8px; }
.task-desc { margin-top: 12px; }
.video-preview { margin-top: 12px; display: grid; grid-template-columns: 88px 1fr; gap: 10px; align-items: center; }
.play-box { height: 60px; border-radius: 8px; background: #111827; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; }
.video-preview a { color: #2563eb; word-break: break-all; font-size: 13px; }
@media (max-width: 980px) {
  .hero { align-items: flex-start; flex-direction: column; }
  .context { width: 100%; flex-wrap: wrap; }
  .editor-grid, .image-compare { grid-template-columns: 1fr; }
}
</style>
